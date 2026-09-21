"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { PHOTO_BUCKET, removeCover, uploadCover } from "@/lib/covers";
import { parseMemberForm } from "@/lib/member-form";
import { MISSING_MANDAT_TABLE } from "@/lib/mandat";
import { supabaseAdmin } from "@/lib/supabase";

export type MemberFormState = {
  error?: string;
  values?: Record<string, string>;
} | null;

function dbError(code?: string) {
  return code === "PGRST205" ? MISSING_MANDAT_TABLE : "L'enregistrement a échoué, réessaie.";
}

function done() {
  updateTag("mandat");
  revalidatePath("/backoffice/mandat");
  redirect("/backoffice/mandat");
}

export async function createMember(
  _prev: MemberFormState,
  formData: FormData,
): Promise<MemberFormState> {
  await requireAdmin();
  const { values, row, position, photo, error } = parseMemberForm(formData);
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
  const { values, row, position, photo, removePhoto, error } = parseMemberForm(formData);
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

  updateTag("mandat");
  revalidatePath("/backoffice/mandat");
}
