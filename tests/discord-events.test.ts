import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  deleteDiscordEvent,
  upsertDiscordEvent,
  type DiscordEventInput,
} from "@/lib/discord-events";

// Le corps JSON envoyé à Discord est inspecté librement dans les tests.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Call = { url: string; method: string; headers: Record<string, string>; body: any };

let calls: Call[];
let respond: (call: Call) => Response | Promise<Response>;

const json = (status: number, body: unknown = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const input = (overrides: Partial<DiscordEventInput> = {}): DiscordEventInput => ({
  title: "Atelier fresque du climat",
  description: "Venez nombreux.",
  location: "Salle 12",
  startsAt: "2026-10-01T18:00:00",
  endsAt: "2026-10-01T20:00:00",
  coverUrl: null,
  siteUrl: "https://harmony.example",
  ...overrides,
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-21T10:00:00Z"));
  process.env.DISCORD_BOT_TOKEN = "token-de-test";
  process.env.DISCORD_GUILD_ID = "guild-1";
  vi.spyOn(console, "error").mockImplementation(() => {});

  calls = [];
  respond = () => json(200, { id: "evt-1" });
  vi.stubGlobal("fetch", async (url: string, init: RequestInit = {}) => {
    const call: Call = {
      url,
      method: init.method ?? "GET",
      headers: (init.headers ?? {}) as Record<string, string>,
      body: typeof init.body === "string" ? JSON.parse(init.body) : undefined,
    };
    calls.push(call);
    return respond(call);
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("upsertDiscordEvent : création", () => {
  it("crée l'événement avec l'heure de Paris convertie en instant exact", async () => {
    const result = await upsertDiscordEvent(input(), null);

    expect(result).toEqual({ ok: true, id: "evt-1" });
    expect(calls).toHaveLength(1);
    expect(calls[0].method).toBe("POST");
    expect(calls[0].url).toBe("https://discord.com/api/v10/guilds/guild-1/scheduled-events");
    expect(calls[0].headers.Authorization).toBe("Bot token-de-test");
    expect(calls[0].body).toMatchObject({
      name: "Atelier fresque du climat",
      privacy_level: 2,
      entity_type: 3,
      entity_metadata: { location: "Salle 12" },
      scheduled_start_time: "2026-10-01T16:00:00.000Z", // 18:00 à Paris (UTC+2)
      scheduled_end_time: "2026-10-01T18:00:00.000Z",
    });
  });

  it("ajoute le lien vers la page Event à la description", async () => {
    await upsertDiscordEvent(input(), null);
    expect(calls[0].body.description).toBe("Venez nombreux.\n\nhttps://harmony.example/event");
  });

  it("met « Lieu à préciser » quand le lieu est vide (Discord l'exige)", async () => {
    await upsertDiscordEvent(input({ location: "  " }), null);
    expect(calls[0].body.entity_metadata.location).toBe("Lieu à préciser");
  });

  it("tronque le titre, le lieu et la description aux limites de Discord", async () => {
    await upsertDiscordEvent(
      input({ title: "T".repeat(150), location: "L".repeat(150), description: "D".repeat(2000) }),
      null,
    );
    const { name, entity_metadata, description } = calls[0].body;
    expect(name).toHaveLength(100);
    expect(name.endsWith("…")).toBe(true);
    expect(entity_metadata.location).toHaveLength(100);
    expect(description.length).toBeLessThanOrEqual(1000);
    expect(description.endsWith("https://harmony.example/event")).toBe(true);
  });

  it("utilise l'heure d'hiver en hiver", async () => {
    vi.setSystemTime(new Date("2026-11-01T10:00:00Z"));
    await upsertDiscordEvent(
      input({ startsAt: "2026-12-15T20:00:00", endsAt: "2026-12-15T22:00:00" }),
      null,
    );
    expect(calls[0].body.scheduled_start_time).toBe("2026-12-15T19:00:00.000Z");
  });
});

describe("upsertDiscordEvent : refus et échecs", () => {
  it("ne fait rien si le bot n'est pas configuré", async () => {
    delete process.env.DISCORD_BOT_TOKEN;
    expect(await upsertDiscordEvent(input(), null)).toEqual({ ok: false, reason: "disabled" });
    expect(calls).toHaveLength(0);
  });

  it("n'appelle pas Discord pour un événement déjà commencé", async () => {
    const result = await upsertDiscordEvent(
      input({ startsAt: "2026-09-21T09:00:00", endsAt: "2026-09-21T23:00:00" }),
      null,
    );
    expect(result).toEqual({ ok: false, reason: "past" });
    expect(calls).toHaveLength(0);
  });

  it("refuse un début dans moins d'une minute", async () => {
    // 10:00:30Z = 12:00:30 à Paris : dans 30 s
    const result = await upsertDiscordEvent(
      input({ startsAt: "2026-09-21T12:00:30", endsAt: "2026-09-21T13:00:00" }),
      null,
    );
    expect(result).toEqual({ ok: false, reason: "past" });
  });

  it.each([401, 403])("signale une permission refusée (HTTP %i)", async (status) => {
    respond = () => json(status, { message: "Missing Permissions" });
    expect(await upsertDiscordEvent(input(), null)).toEqual({ ok: false, reason: "forbidden" });
  });

  it("signale un échec pour une erreur serveur", async () => {
    respond = () => json(500);
    expect(await upsertDiscordEvent(input(), null)).toEqual({ ok: false, reason: "failed" });
  });

  it("signale un échec si le réseau plante", async () => {
    respond = () => {
      throw new Error("réseau coupé");
    };
    expect(await upsertDiscordEvent(input(), null)).toEqual({ ok: false, reason: "failed" });
  });
});

describe("upsertDiscordEvent : mise à jour", () => {
  it("modifie l'événement existant", async () => {
    const result = await upsertDiscordEvent(input({ title: "Nouveau titre" }), "evt-9");
    expect(result).toEqual({ ok: true, id: "evt-9" });
    expect(calls).toHaveLength(1);
    expect(calls[0].method).toBe("PATCH");
    expect(calls[0].url.endsWith("/scheduled-events/evt-9")).toBe(true);
    expect(calls[0].body.name).toBe("Nouveau titre");
  });

  it("recrée l'événement s'il a été supprimé sur Discord (404)", async () => {
    respond = (call) => (call.method === "PATCH" ? json(404) : json(200, { id: "evt-nouveau" }));
    const result = await upsertDiscordEvent(input(), "evt-supprime");
    expect(result).toEqual({ ok: true, id: "evt-nouveau" });
    expect(calls.map((c) => c.method)).toEqual(["PATCH", "POST"]);
  });

  it("ne recrée pas l'événement pour une autre erreur", async () => {
    respond = () => json(500);
    const result = await upsertDiscordEvent(input(), "evt-9");
    expect(result).toEqual({ ok: false, reason: "failed" });
    expect(calls.map((c) => c.method)).toEqual(["PATCH"]);
  });
});

describe("upsertDiscordEvent : image de couverture", () => {
  const withCover = (type: string) => {
    respond = (call) =>
      call.url.startsWith("https://cdn.example")
        ? new Response(new Uint8Array([1, 2, 3]), { headers: { "content-type": type } })
        : json(200, { id: "evt-1" });
  };

  it("joint l'image d'un PNG en data URI", async () => {
    withCover("image/png");
    await upsertDiscordEvent(input({ coverUrl: "https://cdn.example/cover.png" }), null);
    const post = calls.find((c) => c.method === "POST")!;
    expect(post.body.image).toBe(
      `data:image/png;base64,${Buffer.from([1, 2, 3]).toString("base64")}`,
    );
  });

  it("ignore un format que Discord n'accepte pas (WebP)", async () => {
    withCover("image/webp");
    await upsertDiscordEvent(input({ coverUrl: "https://cdn.example/cover.webp" }), null);
    const post = calls.find((c) => c.method === "POST")!;
    expect(post.body).not.toHaveProperty("image");
  });

  it("crée quand même l'événement si l'image est introuvable", async () => {
    respond = (call) =>
      call.url.startsWith("https://cdn.example") ? json(404) : json(200, { id: "evt-1" });
    const result = await upsertDiscordEvent(
      input({ coverUrl: "https://cdn.example/absente.png" }),
      null,
    );
    expect(result).toEqual({ ok: true, id: "evt-1" });
  });

  it("retire l'image d'un événement existant quand la cover est supprimée", async () => {
    await upsertDiscordEvent(input({ coverUrl: null }), "evt-9");
    expect(calls[0].body.image).toBeNull();
  });
});

describe("deleteDiscordEvent", () => {
  it("supprime l'événement", async () => {
    respond = () => new Response(null, { status: 204 });
    expect(await deleteDiscordEvent("evt-9")).toBe(true);
    expect(calls[0].method).toBe("DELETE");
    expect(calls[0].url.endsWith("/scheduled-events/evt-9")).toBe(true);
  });

  it("considère un événement déjà supprimé comme réussi (404)", async () => {
    respond = () => json(404);
    expect(await deleteDiscordEvent("evt-9")).toBe(true);
  });

  it("signale un échec pour une autre erreur ou un bot non configuré", async () => {
    respond = () => json(403);
    expect(await deleteDiscordEvent("evt-9")).toBe(false);
    delete process.env.DISCORD_BOT_TOKEN;
    expect(await deleteDiscordEvent("evt-9")).toBe(false);
  });
});
