import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { MemberRow } from "./mandat-format";
import { supabaseAdmin } from "./supabase";

export const MISSING_MANDAT_TABLE =
  "La table « mandat_members » n'existe pas encore : exécute supabase/migrations/20260922_create_mandat_members.sql dans le SQL Editor de Supabase.";

const COLUMNS =
  "id,name,role,team,photo_url,email,discord,show_photo,show_email,show_discord,position";

// Liste mise en cache (étiquette « mandat », rafraîchie à chaque modification depuis le backoffice).
async function fetchMembers(): Promise<MemberRow[]> {
  "use cache";
  cacheTag("mandat");
  cacheLife("hours");

  const { data, error } = await supabaseAdmin()
    .from("mandat_members")
    .select(COLUMNS)
    .order("position", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(`db:${error.code ?? "unknown"}`);
  return data as MemberRow[];
}

export async function listMembers() {
  try {
    return { members: await fetchMembers(), error: null };
  } catch (e) {
    const code = e instanceof Error ? e.message.replace("db:", "") : "";
    return {
      members: [] as MemberRow[],
      error: code === "PGRST205" ? MISSING_MANDAT_TABLE : "Impossible de charger les membres.",
    };
  }
}

export async function getMember(id: string) {
  const { data } = await supabaseAdmin()
    .from("mandat_members")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();
  return (data as MemberRow | null) ?? null;
}
