import "server-only";
import { siteUrl } from "./discord";
import { deleteDiscordEvent, isBotConfigured, upsertDiscordEvent } from "./discord-events";
import { eventEnd, type EventRow } from "./event-format";
import { supabaseAdmin } from "./supabase";

export type SyncNotice =
  | "none"
  | "synced"
  | "removed"
  | "past"
  | "forbidden"
  | "failed"
  | "nocolumn";

const MISSING_COLUMN = "42703";

// L'identifiant Discord est lu à part : si la migration n'est pas passée, le reste du site continue de marcher.
async function readDiscordId(eventId: string) {
  const { data, error } = await supabaseAdmin()
    .from("events")
    .select("discord_event_id")
    .eq("id", eventId)
    .maybeSingle();
  if (error) return { id: null, missingColumn: error.code === MISSING_COLUMN };
  return { id: (data?.discord_event_id as string | null | undefined) ?? null, missingColumn: false };
}

// Aligne l'événement Discord sur l'événement du site : création, mise à jour ou retrait (brouillon).
export async function syncEventToDiscord(eventId: string): Promise<SyncNotice> {
  if (!isBotConfigured()) return "none";

  const db = supabaseAdmin();
  const { id: discordId, missingColumn } = await readDiscordId(eventId);
  if (missingColumn) return "nocolumn";

  const { data } = await db
    .from("events")
    .select("id,title,description,location,starts_at,ends_at,published,cover_url")
    .eq("id", eventId)
    .maybeSingle();
  const event = data as EventRow | null;
  if (!event) return "failed";

  if (!event.published) {
    if (!discordId) return "none";
    const removed = await deleteDiscordEvent(discordId);
    if (removed) await db.from("events").update({ discord_event_id: null }).eq("id", eventId);
    return removed ? "removed" : "failed";
  }

  const result = await upsertDiscordEvent(
    {
      title: event.title,
      description: event.description,
      location: event.location,
      startsAt: event.starts_at,
      endsAt: eventEnd(event),
      coverUrl: event.cover_url,
      siteUrl: siteUrl(),
    },
    discordId,
  );

  if (!result.ok) {
    return result.reason === "past"
      ? "past"
      : result.reason === "forbidden"
        ? "forbidden"
        : result.reason === "disabled"
          ? "none"
          : "failed";
  }

  if (result.id !== discordId) {
    await db.from("events").update({ discord_event_id: result.id }).eq("id", eventId);
  }
  return "synced";
}

export async function discordIdOf(eventId: string) {
  return (await readDiscordId(eventId)).id;
}

// Ids des événements du site qui existent aussi sur Discord (vide si la migration n'est pas passée).
export async function eventsOnDiscord(): Promise<Set<string>> {
  const { data, error } = await supabaseAdmin()
    .from("events")
    .select("id")
    .not("discord_event_id", "is", null);
  if (error || !data) return new Set();
  return new Set(data.map((row) => row.id as string));
}
