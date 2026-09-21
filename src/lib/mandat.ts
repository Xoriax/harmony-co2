import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { MemberRow } from "./mandat-format";
import { supabaseAdmin } from "./supabase";

export const MISSING_MANDAT_TABLE =
  "La table « mandat_members » n'existe pas encore : exécute supabase/migrations/20260922_create_mandat_members.sql dans le SQL Editor de Supabase.";

const COLUMNS =
  "id,name,role,team,photo_url,email,discord,show_photo,show_email,show_discord,position";

// Les erreurs sont renvoyées (et non levées) : une erreur levée dans une fonction en cache fait
// échouer le prérendu, y compris quand la base est injoignable ou la table pas encore créée.
type Fetched = { members: MemberRow[]; code: string | null };

// Liste mise en cache (étiquette « mandat », rafraîchie à chaque modification depuis le backoffice).
async function fetchMembers(): Promise<Fetched> {
  "use cache";
  cacheTag("mandat");

  try {
    const { data, error } = await supabaseAdmin()
      .from("mandat_members")
      .select(COLUMNS)
      .order("position", { ascending: true })
      .order("name", { ascending: true });
    // Une erreur n'est gardée qu'une minute : elle disparaît dès que la base répond de nouveau.
    if (error) cacheLife("minutes");
    else cacheLife("hours");
    if (error) return { members: [], code: error.code || "unknown" };
    return { members: data as MemberRow[], code: null };
  } catch {
    cacheLife("minutes");
    return { members: [], code: "unknown" };
  }
}

export async function listMembers() {
  const { members, code } = await fetchMembers();
  if (code === null) return { members, error: null };

  return {
    members,
    error: code === "PGRST205" ? MISSING_MANDAT_TABLE : "Impossible de charger les membres.",
  };
}

export async function getMember(id: string) {
  const { data } = await supabaseAdmin()
    .from("mandat_members")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();
  return (data as MemberRow | null) ?? null;
}
