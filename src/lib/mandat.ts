import "server-only";
import type { MemberRow } from "./mandat-format";
import { supabaseAdmin } from "./supabase";

export const MISSING_MANDAT_TABLE =
  "La table « mandat_members » n'existe pas encore : exécute supabase/migrations/20260922_create_mandat_members.sql dans le SQL Editor de Supabase.";

const COLUMNS =
  "id,name,role,team,photo_url,email,discord,show_photo,show_email,show_discord,position";

export async function listMembers() {
  const { data, error } = await supabaseAdmin()
    .from("mandat_members")
    .select(COLUMNS)
    .order("position", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return {
      members: [] as MemberRow[],
      error:
        error.code === "PGRST205" ? MISSING_MANDAT_TABLE : "Impossible de charger les membres.",
    };
  }
  return { members: data as MemberRow[], error: null };
}

export async function getMember(id: string) {
  const { data } = await supabaseAdmin()
    .from("mandat_members")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();
  return (data as MemberRow | null) ?? null;
}
