"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { removeCover, uploadCover } from "@/lib/covers";
import { deleteDiscordEvent } from "@/lib/discord-events";
import { discordIdOf, syncEventToDiscord } from "@/lib/discord-sync";
import { parseEventForm } from "@/lib/event-form";
import { MISSING_COLUMN, MISSING_TABLE } from "@/lib/events";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export type EventFormState = {
  error?: string;
  values?: Record<string, string>;
} | null;

async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/connexion");
  if (!session.admin) redirect("/");
}

function dbError(code?: string) {
  if (code === "PGRST205") return MISSING_TABLE;
  if (code === "42703") return MISSING_COLUMN;
  return "L'enregistrement a échoué, réessaie.";
}

export async function createEvent(
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  await requireSession();
  const { values, row, cover, error } = parseEventForm(formData);
  if (error) return { error, values };

  let coverUrl: string | null = null;
  if (cover) {
    const uploaded = await uploadCover(cover);
    if ("error" in uploaded) return { error: uploaded.error, values };
    coverUrl = uploaded.url;
  }

  const { data: created, error: dbErr } = await supabaseAdmin()
    .from("events")
    .insert({ ...row, cover_url: coverUrl })
    .select("id")
    .single();
  if (dbErr || !created) {
    await removeCover(coverUrl);
    return { error: dbError(dbErr?.code), values };
  }

  const notice = await syncEventToDiscord(created.id);
  updateTag("events");
  revalidatePath("/backoffice");
  redirect(notice === "none" ? "/backoffice" : `/backoffice?notice=${notice}`);
}

export async function updateEvent(
  id: string,
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  await requireSession();
  const { values, row, cover, removeCoverRequested, error } = parseEventForm(formData);
  if (error) return { error, values };

  const db = supabaseAdmin();
  const { data: current } = await db.from("events").select("cover_url").eq("id", id).maybeSingle();
  const oldUrl = (current?.cover_url as string | null | undefined) ?? null;

  let coverChange: { cover_url: string | null } | Record<string, never> = {};
  if (cover) {
    const uploaded = await uploadCover(cover);
    if ("error" in uploaded) return { error: uploaded.error, values };
    coverChange = { cover_url: uploaded.url };
  } else if (removeCoverRequested) {
    coverChange = { cover_url: null };
  }

  const { error: dbErr } = await db
    .from("events")
    .update({ ...row, ...coverChange, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (dbErr) {
    if ("cover_url" in coverChange) await removeCover(coverChange.cover_url);
    return { error: dbError(dbErr.code), values };
  }
  if ("cover_url" in coverChange) await removeCover(oldUrl);

  const notice = await syncEventToDiscord(id);
  updateTag("events");
  revalidatePath("/backoffice");
  redirect(notice === "none" ? "/backoffice" : `/backoffice?notice=${notice}`);
}

export async function deleteEvent(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const db = supabaseAdmin();
  const { data: current } = await db.from("events").select("cover_url").eq("id", id).maybeSingle();
  const discordId = await discordIdOf(id);
  const { error } = await db.from("events").delete().eq("id", id);
  if (!error) {
    await removeCover(current?.cover_url as string | null | undefined);
    if (discordId) await deleteDiscordEvent(discordId);
  }
  updateTag("events");
  revalidatePath("/backoffice");
}
