"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit-log";
import { removeCover, uploadCover } from "@/lib/covers";
import { deleteDiscordEvent } from "@/lib/discord-events";
import { eventAnnouncementPayload } from "@/lib/discord-messages";
import { postEventAnnouncement } from "@/lib/discord-notify";
import { discordIdOf, syncEventToDiscord } from "@/lib/discord-sync";
import { parseEventForm } from "@/lib/event-form";
import { MISSING_COLUMN, MISSING_TABLE } from "@/lib/events";
import { siteUrl } from "@/lib/seo";
import { supabaseAdmin } from "@/lib/supabase";

export type EventFormState = {
  error?: string;
  values?: Record<string, string>;
} | null;

function dbError(code?: string) {
  if (code === "PGRST205") return MISSING_TABLE;
  if (code === "42703") return MISSING_COLUMN;
  return "L'enregistrement a échoué, réessaie.";
}

export async function createEvent(
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const session = await requireAdmin();
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
  await logAudit("event_create", session, row.title);

  const notice = await syncEventToDiscord(created.id);
  // Annonce dans le salon dédié, seulement à la création et seulement si l'événement est publié.
  if (row.published) {
    await postEventAnnouncement(
      eventAnnouncementPayload(
        { ...row, cover_url: coverUrl },
        siteUrl(),
        process.env.DISCORD_EVENT_ANNOUNCE_ROLE_ID ?? null,
      ),
    );
  }
  updateTag("events");
  revalidatePath("/backoffice");
  redirect(notice === "none" ? "/backoffice" : `/backoffice?notice=${notice}`);
}

export async function updateEvent(
  id: string,
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const session = await requireAdmin();
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
  await logAudit("event_update", session, row.title);

  const notice = await syncEventToDiscord(id);
  updateTag("events");
  revalidatePath("/backoffice");
  redirect(notice === "none" ? "/backoffice" : `/backoffice?notice=${notice}`);
}

export async function deleteEvent(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const db = supabaseAdmin();
  const { data: current } = await db
    .from("events")
    .select("title,cover_url")
    .eq("id", id)
    .maybeSingle();
  const discordId = await discordIdOf(id);
  const { error } = await db.from("events").delete().eq("id", id);
  if (!error) {
    await removeCover(current?.cover_url as string | null | undefined);
    if (discordId) await deleteDiscordEvent(discordId);
    await logAudit("event_delete", session, (current?.title as string | undefined) ?? null);
  }
  updateTag("events");
  revalidatePath("/backoffice");
}
