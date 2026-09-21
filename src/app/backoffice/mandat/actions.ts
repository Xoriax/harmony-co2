"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { PHOTO_BUCKET, removeCover, uploadCover, validateCover } from "@/lib/covers";
import { isTeam } from "@/lib/mandat-format";
import { MISSING_MANDAT_TABLE } from "@/lib/mandat";
import { supabaseAdmin } from "@/lib/supabase";

export type MemberFormState = {
  error?: string;
  values?: Record<string, string>;
} | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parse(formData: FormData) {
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const flag = (key: string) => (formData.get(key) ? "on" : "");
  const values = {
    name: text("name"),
    role: text("role"),
    team: text("team"),
    email: text("email"),
    discord: text("discord"),
    position: text("position"),
    show_photo: flag("show_photo"),
    show_email: flag("show_email"),
    show_discord: flag("show_discord"),
  };

  const file = formData.get("photo");
  const photo = file instanceof File && file.size > 0 ? file : null;
  const removePhoto = Boolean(formData.get("remove_photo"));
  const position = values.position === "" ? null : Number(values.position);

  let error: string | null = null;
  if (!values.name) error = "Le nom est obligatoire.";
  else if (values.name.length > 80) error = "Le nom ne doit pas dépasser 80 caractères.";
  else if (!values.role) error = "Le poste est obligatoire.";
  else if (values.role.length > 80) error = "Le poste ne doit pas dépasser 80 caractères.";
  else if (!isTeam(values.team)) error = "Choisis un groupe.";
  else if (values.email && (values.email.length > 120 || !EMAIL_RE.test(values.email)))
    error = "L'adresse e-mail est invalide.";
  else if (values.discord.length > 60) error = "Le Discord ne doit pas dépasser 60 caractères.";
  else if (position !== null && (!Number.isInteger(position) || position < 0 || position > 9999))
    error = "L'ordre doit être un nombre entier positif.";
  else if (photo) error = validateCover(photo);

  const row = {
    name: values.name,
    role: values.role,
    team: values.team,
    email: values.email,
    discord: values.discord,
    show_photo: Boolean(values.show_photo),
    show_email: Boolean(values.show_email),
    show_discord: Boolean(values.show_discord),
  };
  return { values, row, position, photo, removePhoto, error };
}

function dbError(code?: string) {
  return code === "PGRST205" ? MISSING_MANDAT_TABLE : "L'enregistrement a échoué, réessaie.";
}

function done() {
  revalidatePath("/backoffice/mandat");
  revalidatePath("/mandat");
  redirect("/backoffice/mandat");
}

export async function createMember(
  _prev: MemberFormState,
  formData: FormData,
): Promise<MemberFormState> {
  await requireAdmin();
  const { values, row, position, photo, error } = parse(formData);
  if (error) return { error, values };

  const db = supabaseAdmin();

  // Sans ordre saisi, le nouveau membre passe en dernier de son groupe.
  let order = position;
  if (order === null) {
    const { data: last } = await db
      .from("mandat_members")
      .select("position")
      .eq("team", row.team)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    order = ((last?.position as number | undefined) ?? -1) + 1;
  }

  let photoUrl: string | null = null;
  if (photo) {
    const uploaded = await uploadCover(photo, PHOTO_BUCKET);
    if ("error" in uploaded) return { error: uploaded.error, values };
    photoUrl = uploaded.url;
  }

  const { error: dbErr } = await db
    .from("mandat_members")
    .insert({ ...row, position: order, photo_url: photoUrl });
  if (dbErr) {
    await removeCover(photoUrl, PHOTO_BUCKET);
    return { error: dbError(dbErr.code), values };
  }
  done();
  return null;
}

export async function updateMember(
  id: string,
  _prev: MemberFormState,
  formData: FormData,
): Promise<MemberFormState> {
  await requireAdmin();
  const { values, row, position, photo, removePhoto, error } = parse(formData);
  if (error) return { error, values };

  const db = supabaseAdmin();
  const { data: current } = await db
    .from("mandat_members")
    .select("photo_url,position")
    .eq("id", id)
    .maybeSingle();
  const oldUrl = (current?.photo_url as string | null | undefined) ?? null;

  let photoChange: { photo_url: string | null } | Record<string, never> = {};
  if (photo) {
    const uploaded = await uploadCover(photo, PHOTO_BUCKET);
    if ("error" in uploaded) return { error: uploaded.error, values };
    photoChange = { photo_url: uploaded.url };
  } else if (removePhoto) {
    photoChange = { photo_url: null };
  }

  const { error: dbErr } = await db
    .from("mandat_members")
    .update({
      ...row,
      ...(position !== null ? { position } : {}),
      ...photoChange,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (dbErr) {
    if ("photo_url" in photoChange) await removeCover(photoChange.photo_url, PHOTO_BUCKET);
    return { error: dbError(dbErr.code), values };
  }
  if ("photo_url" in photoChange) await removeCover(oldUrl, PHOTO_BUCKET);

  done();
  return null;
}

export async function deleteMember(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const db = supabaseAdmin();
  const { data: current } = await db
    .from("mandat_members")
    .select("photo_url")
    .eq("id", id)
    .maybeSingle();
  const { error } = await db.from("mandat_members").delete().eq("id", id);
  if (!error) await removeCover(current?.photo_url as string | null | undefined, PHOTO_BUCKET);

  revalidatePath("/backoffice/mandat");
  revalidatePath("/mandat");
}
