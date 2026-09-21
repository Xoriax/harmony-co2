"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { removeCover, uploadCover, validateCover } from "@/lib/covers";
import { MISSING_COLUMN, MISSING_TABLE } from "@/lib/events";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export type EventFormState = {
  error?: string;
  values?: Record<string, string>;
} | null;

const DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

function parse(formData: FormData) {
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const values = {
    title: text("title"),
    description: text("description"),
    location: text("location"),
    starts_at: text("starts_at"),
    ends_at: text("ends_at"),
    published: formData.get("published") ? "on" : "",
  };

  const file = formData.get("cover");
  const cover = file instanceof File && file.size > 0 ? file : null;
  const removeCoverRequested = Boolean(formData.get("remove_cover"));

  let error: string | null = null;
  if (!values.title) error = "Le titre est obligatoire.";
  else if (values.title.length > 120) error = "Le titre ne doit pas dépasser 120 caractères.";
  else if (values.location.length > 120) error = "Le lieu ne doit pas dépasser 120 caractères.";
  else if (values.description.length > 2000)
    error = "La description ne doit pas dépasser 2000 caractères.";
  else if (!DATE_RE.test(values.starts_at)) error = "La date de début est obligatoire.";
  else if (!values.ends_at) error = "La date de fin est obligatoire.";
  else if (!DATE_RE.test(values.ends_at)) error = "La date de fin est invalide.";
  else if (values.ends_at <= values.starts_at) error = "La fin doit être après le début.";
  else if (cover) error = validateCover(cover);

  const row = {
    title: values.title,
    description: values.description,
    location: values.location,
    starts_at: `${values.starts_at}:00`,
    ends_at: `${values.ends_at}:00`,
    published: Boolean(values.published),
  };
  return { values, row, cover, removeCoverRequested, error };
}

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
  const { values, row, cover, error } = parse(formData);
  if (error) return { error, values };

  let coverUrl: string | null = null;
  if (cover) {
    const uploaded = await uploadCover(cover);
    if ("error" in uploaded) return { error: uploaded.error, values };
    coverUrl = uploaded.url;
  }

  const { error: dbErr } = await supabaseAdmin()
    .from("events")
    .insert({ ...row, cover_url: coverUrl });
  if (dbErr) {
    await removeCover(coverUrl);
    return { error: dbError(dbErr.code), values };
  }

  revalidatePath("/backoffice");
  revalidatePath("/event");
  redirect("/backoffice");
}

export async function updateEvent(
  id: string,
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  await requireSession();
  const { values, row, cover, removeCoverRequested, error } = parse(formData);
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

  revalidatePath("/backoffice");
  revalidatePath("/event");
  redirect("/backoffice");
}

export async function deleteEvent(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const db = supabaseAdmin();
  const { data: current } = await db.from("events").select("cover_url").eq("id", id).maybeSingle();
  const { error } = await db.from("events").delete().eq("id", id);
  if (!error) await removeCover(current?.cover_url as string | null | undefined);
  revalidatePath("/backoffice");
  revalidatePath("/event");
}
