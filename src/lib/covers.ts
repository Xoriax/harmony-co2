import "server-only";
import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "./supabase";

export const COVER_BUCKET = "event-covers";
export const PHOTO_BUCKET = "mandat-photos";
export const COVER_MAX_BYTES = 5 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function validateCover(file: File): string | null {
  if (!EXTENSIONS[file.type]) return "L'image doit être au format JPG, PNG, WebP ou GIF.";
  if (file.size > COVER_MAX_BYTES) return "L'image ne doit pas dépasser 5 Mo.";
  return null;
}

// Envoie une image dans un bucket public (créé au besoin) et renvoie son URL publique.
export async function uploadCover(
  file: File,
  bucket: string = COVER_BUCKET,
): Promise<{ url: string } | { error: string }> {
  const storage = supabaseAdmin().storage;
  const path = `${randomUUID()}.${EXTENSIONS[file.type]}`;
  const body = Buffer.from(await file.arrayBuffer());
  const send = () =>
    storage.from(bucket).upload(path, body, {
      contentType: file.type,
      cacheControl: "31536000",
    });

  let { error } = await send();
  if (error && /bucket not found/i.test(error.message)) {
    await storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: COVER_MAX_BYTES,
      allowedMimeTypes: Object.keys(EXTENSIONS),
    });
    ({ error } = await send());
  }
  if (error) return { error: "L'envoi de l'image a échoué, réessaie." };

  return { url: storage.from(bucket).getPublicUrl(path).data.publicUrl };
}

export async function removeCover(url: string | null | undefined, bucket: string = COVER_BUCKET) {
  if (!url) return;
  const marker = `/${bucket}/`;
  const index = url.indexOf(marker);
  if (index < 0) return;
  const path = decodeURIComponent(url.slice(index + marker.length));
  await supabaseAdmin().storage.from(bucket).remove([path]);
}
