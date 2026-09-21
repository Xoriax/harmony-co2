import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { EventRow } from "./event-format";
import { supabaseAdmin } from "./supabase";

export const MISSING_TABLE =
  "La table « events » n'existe pas encore : exécute supabase/migrations/20260921_create_events.sql dans le SQL Editor de Supabase.";

export const MISSING_COLUMN =
  "La colonne « cover_url » n'existe pas encore : exécute supabase/migrations/20260921_add_event_cover.sql dans le SQL Editor de Supabase.";

// Résultat d'une lecture mise en cache : les erreurs sont renvoyées (et non levées) car une erreur
// levée dans une fonction en cache fait échouer le prérendu, y compris quand la base est injoignable.
type Fetched = { events: EventRow[]; code: null } | { events: EventRow[]; code: string };

// Liste mise en cache (étiquette « events », rafraîchie à chaque modification depuis le backoffice).
async function fetchEvents(publishedOnly: boolean): Promise<Fetched> {
  "use cache";
  cacheTag("events");

  try {
    let query = supabaseAdmin()
      .from("events")
      .select("id,title,description,location,starts_at,ends_at,published,cover_url")
      .order("starts_at", { ascending: true });
    if (publishedOnly) query = query.eq("published", true);

    const { data, error } = await query;
    // Une erreur n'est gardée qu'une minute : elle disparaît dès que la base répond de nouveau.
    if (error) cacheLife("minutes");
    else cacheLife("hours");
    if (error) return { events: [], code: error.code || "unknown" };
    return { events: data as EventRow[], code: null };
  } catch {
    cacheLife("minutes");
    return { events: [], code: "unknown" };
  }
}

export async function listEvents(options?: { publishedOnly?: boolean }) {
  const { events, code } = await fetchEvents(Boolean(options?.publishedOnly));
  if (code === null) return { events, error: null };

  return {
    events,
    error:
      code === "PGRST205"
        ? MISSING_TABLE
        : code === "42703"
          ? MISSING_COLUMN
          : "Impossible de charger les événements.",
  };
}

export async function getEvent(id: string) {
  const { data } = await supabaseAdmin()
    .from("events")
    .select("id,title,description,location,starts_at,ends_at,published,cover_url")
    .eq("id", id)
    .maybeSingle();
  return (data as EventRow | null) ?? null;
}
