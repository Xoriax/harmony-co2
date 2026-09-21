import "server-only";
import { supabaseAdmin } from "./supabase";
import type { EventRow } from "./event-format";

export const MISSING_TABLE =
  "La table « events » n'existe pas encore : exécute supabase/migrations/20260921_create_events.sql dans le SQL Editor de Supabase.";

export const MISSING_COLUMN =
  "La colonne « cover_url » n'existe pas encore : exécute supabase/migrations/20260921_add_event_cover.sql dans le SQL Editor de Supabase.";

export async function listEvents(options?: { publishedOnly?: boolean }) {
  let query = supabaseAdmin()
    .from("events")
    .select("id,title,description,location,starts_at,ends_at,published,cover_url")
    .order("starts_at", { ascending: true });
  if (options?.publishedOnly) query = query.eq("published", true);

  const { data, error } = await query;
  if (error) {
    return {
      events: [] as EventRow[],
      error:
        error.code === "PGRST205"
          ? MISSING_TABLE
          : error.code === "42703"
            ? MISSING_COLUMN
            : "Impossible de charger les événements.",
    };
  }
  return { events: data as EventRow[], error: null };
}

export async function getEvent(id: string) {
  const { data } = await supabaseAdmin()
    .from("events")
    .select("id,title,description,location,starts_at,ends_at,published,cover_url")
    .eq("id", id)
    .maybeSingle();
  return (data as EventRow | null) ?? null;
}
