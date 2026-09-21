import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { EventRow } from "./event-format";
import { supabaseAdmin } from "./supabase";

export const MISSING_TABLE =
  "La table « events » n'existe pas encore : exécute supabase/migrations/20260921_create_events.sql dans le SQL Editor de Supabase.";

export const MISSING_COLUMN =
  "La colonne « cover_url » n'existe pas encore : exécute supabase/migrations/20260921_add_event_cover.sql dans le SQL Editor de Supabase.";

// Liste mise en cache (étiquette « events », rafraîchie à chaque modification depuis le backoffice).
// Une erreur est levée et non renvoyée : ainsi elle n'est jamais mise en cache.
async function fetchEvents(publishedOnly: boolean): Promise<EventRow[]> {
  "use cache";
  cacheTag("events");
  cacheLife("hours");

  let query = supabaseAdmin()
    .from("events")
    .select("id,title,description,location,starts_at,ends_at,published,cover_url")
    .order("starts_at", { ascending: true });
  if (publishedOnly) query = query.eq("published", true);

  const { data, error } = await query;
  if (error) throw new Error(`db:${error.code ?? "unknown"}`);
  return data as EventRow[];
}

export async function listEvents(options?: { publishedOnly?: boolean }) {
  try {
    return { events: await fetchEvents(Boolean(options?.publishedOnly)), error: null };
  } catch (e) {
    const code = e instanceof Error ? e.message.replace("db:", "") : "";
    return {
      events: [] as EventRow[],
      error:
        code === "PGRST205"
          ? MISSING_TABLE
          : code === "42703"
            ? MISSING_COLUMN
            : "Impossible de charger les événements.",
    };
  }
}

export async function getEvent(id: string) {
  const { data } = await supabaseAdmin()
    .from("events")
    .select("id,title,description,location,starts_at,ends_at,published,cover_url")
    .eq("id", id)
    .maybeSingle();
  return (data as EventRow | null) ?? null;
}
