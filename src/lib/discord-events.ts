import "server-only";

const API = "https://discord.com/api/v10";

export type DiscordEventInput = {
  title: string;
  description: string;
  location: string;
  /** Heures locales de Paris, format "AAAA-MM-JJTHH:mm[:ss]". */
  startsAt: string;
  endsAt: string;
  coverUrl: string | null;
  siteUrl: string;
};

export type DiscordResult =
  | { ok: true; id: string }
  | { ok: false; reason: "disabled" | "past" | "forbidden" | "failed" };

export function isBotConfigured() {
  return Boolean(process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_GUILD_ID);
}

// Les dates du site sont des heures de Paris sans fuseau ; Discord attend un instant exact.
export function parisToDate(local: string): Date {
  const [datePart, timePart] = local.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [h, mi, s = 0] = timePart.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, h, mi, s);

  const format = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Paris",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const offsetAt = (ts: number) => {
    const parts = format.formatToParts(new Date(ts));
    const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);
    return (
      Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second")) - ts
    );
  };

  let ts = guess - offsetAt(guess);
  ts = guess - offsetAt(ts);
  return new Date(ts);
}

const clip = (text: string, max: number) =>
  text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;

async function coverDataUri(url: string | null) {
  if (!url) return null;
  try {
    const res = await fetch(url, { cache: "no-store" });
    const type = res.headers.get("content-type")?.split(";")[0] ?? "";
    // Discord accepte JPEG, PNG et GIF pour l'image d'un événement.
    if (!res.ok || !["image/jpeg", "image/png", "image/gif"].includes(type)) return null;
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}

async function buildBody(event: DiscordEventInput) {
  const start = parisToDate(event.startsAt);
  const end = parisToDate(event.endsAt);
  const link = `\n\n${event.siteUrl}/event`;
  const base = event.description.trim();
  const description = clip(base, 1000 - link.length) + link;
  const image = await coverDataUri(event.coverUrl);

  return {
    start,
    body: {
      name: clip(event.title, 100),
      description,
      privacy_level: 2,
      entity_type: 3,
      entity_metadata: { location: clip(event.location.trim() || "Lieu à préciser", 100) },
      scheduled_start_time: start.toISOString(),
      scheduled_end_time: end.toISOString(),
      // null retire l'image d'un événement existant.
      image,
    } as Record<string, unknown>,
  };
}

async function call(method: string, path: string, body?: unknown) {
  return fetch(`${API}/guilds/${process.env.DISCORD_GUILD_ID}/scheduled-events${path}`, {
    method,
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "DiscordBot (https://github.com/Xoriax/harmony-co2, 1.0)",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
}

function failure(res: Response, action: string): DiscordResult {
  console.error(`[discord] ${action} refusé (${res.status})`);
  return { ok: false, reason: res.status === 403 || res.status === 401 ? "forbidden" : "failed" };
}

// Crée l'événement Discord, ou le met à jour si son identifiant est connu.
export async function upsertDiscordEvent(
  event: DiscordEventInput,
  existingId: string | null,
): Promise<DiscordResult> {
  if (!isBotConfigured()) return { ok: false, reason: "disabled" };

  try {
    const { start, body } = await buildBody(event);
    // Discord refuse de programmer un événement dont le début est passé.
    if (start.getTime() <= Date.now() + 60_000) return { ok: false, reason: "past" };

    if (existingId) {
      const res = await call("PATCH", `/${existingId}`, body);
      if (res.ok) return { ok: true, id: existingId };
      // Événement supprimé côté Discord : on le recrée.
      if (res.status !== 404) return failure(res, "modification");
    }

    if (!body.image) delete body.image;
    const res = await call("POST", "", body);
    if (!res.ok) return failure(res, "création");
    const created = (await res.json()) as { id: string };
    return { ok: true, id: created.id };
  } catch (error) {
    console.error("[discord] appel impossible", error instanceof Error ? error.message : error);
    return { ok: false, reason: "failed" };
  }
}

export async function deleteDiscordEvent(id: string): Promise<boolean> {
  if (!isBotConfigured()) return false;
  try {
    const res = await call("DELETE", `/${id}`);
    return res.ok || res.status === 404;
  } catch {
    return false;
  }
}
