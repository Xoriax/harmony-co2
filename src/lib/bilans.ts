import "server-only";
import { randomUUID } from "node:crypto";
import { buildExcel, buildPdf } from "@/app/bilan/export";
import type { BilanRecord } from "@/app/bilan/types";
import { supabaseAdmin } from "./supabase";

export const BILAN_BUCKET = "bilans";
const MAX_FILE_BYTES = 10 * 1024 * 1024;

export const MISSING_BILANS_TABLE =
  "La table « bilans » n'existe pas encore : exécute supabase/migrations/20260921_create_bilans.sql dans le SQL Editor de Supabase.";

export type BilanRow = {
  id: string;
  total: number;
  categories: { name: string; subtotal: number; count: number }[];
  pdf_path: string;
  xlsx_path: string;
  created_at: string;
  association_name: string;
};

const COLUMNS = "id,total,categories,pdf_path,xlsx_path,created_at,association_name";

// Vue admin (/backoffice/historique) : tous les bilans, tous auteurs confondus, avec de quoi
// afficher qui (ou « anonyme ») l'a généré.
export type AdminBilanRow = BilanRow & { user_id: string; user_name: string };
const ADMIN_COLUMNS = `${COLUMNS},user_id,user_name`;
const ADMIN_LIMIT = 1000;

// Génère le PDF et l'Excel du bilan et les enregistre pour l'utilisateur. Renvoie false en cas d'échec.
export async function saveBilan(
  user: { id: string; name: string },
  result: BilanRecord,
): Promise<boolean> {
  const db = supabaseAdmin();
  const id = randomUUID();
  const pdfPath = `${user.id}/${id}.pdf`;
  const xlsxPath = `${user.id}/${id}.xlsx`;

  try {
    const [pdf, xlsx] = await Promise.all([
      buildPdf(result).then((b) => Buffer.from(b)),
      buildExcel(result).then((b) => Buffer.from(b)),
    ]);

    const upload = (path: string, body: Buffer, contentType: string) =>
      db.storage.from(BILAN_BUCKET).upload(path, body, { contentType });
    const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    let [a, b] = await Promise.all([
      upload(pdfPath, pdf, "application/pdf"),
      upload(xlsxPath, xlsx, XLSX),
    ]);
    if ([a.error, b.error].some((e) => e && /bucket not found/i.test(e.message))) {
      await db.storage.createBucket(BILAN_BUCKET, { public: false, fileSizeLimit: MAX_FILE_BYTES });
      [a, b] = await Promise.all([
        upload(pdfPath, pdf, "application/pdf"),
        upload(xlsxPath, xlsx, XLSX),
      ]);
    }
    if (a.error || b.error) throw new Error("upload");

    const { error } = await db.from("bilans").insert({
      id,
      user_id: user.id,
      user_name: user.name,
      total: result.total,
      categories: result.categories.map((c) => ({
        name: c.name,
        subtotal: c.subtotal,
        count: c.lines.length,
      })),
      pdf_path: pdfPath,
      xlsx_path: xlsxPath,
      association_name: result.associationName,
    });
    if (error) throw new Error("insert");
    return true;
  } catch {
    await db.storage.from(BILAN_BUCKET).remove([pdfPath, xlsxPath]);
    return false;
  }
}

export async function listBilans(userId: string) {
  const { data, error } = await supabaseAdmin()
    .from("bilans")
    .select(COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return {
      bilans: [] as BilanRow[],
      error:
        error.code === "PGRST205" ? MISSING_BILANS_TABLE : "Impossible de charger ton historique.",
    };
  }
  return { bilans: data as BilanRow[], error: null };
}

export async function getBilan(id: string, userId: string) {
  const { data } = await supabaseAdmin()
    .from("bilans")
    .select(COLUMNS)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  return (data as BilanRow | null) ?? null;
}

// Réservé au backoffice (/backoffice/historique) : tous les bilans, y compris ceux générés sans
// connexion. Pas de cache : réservé aux administrateurs, consulté rarement.
export async function listAllBilans() {
  const { data, error } = await supabaseAdmin()
    .from("bilans")
    .select(ADMIN_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(ADMIN_LIMIT);

  if (error) {
    return {
      bilans: [] as AdminBilanRow[],
      error:
        error.code === "PGRST205" ? MISSING_BILANS_TABLE : "Impossible de charger l'historique.",
    };
  }
  return { bilans: data as AdminBilanRow[], error: null };
}

// Réservé au backoffice : un bilan par id, sans filtre de propriétaire (contrairement à getBilan).
export async function getBilanById(id: string) {
  const { data } = await supabaseAdmin()
    .from("bilans")
    .select(ADMIN_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  return (data as AdminBilanRow | null) ?? null;
}

export async function signedFileUrl(path: string, downloadName: string) {
  const { data } = await supabaseAdmin()
    .storage.from(BILAN_BUCKET)
    .createSignedUrl(path, 60, { download: downloadName });
  return data?.signedUrl ?? null;
}

export async function removeBilan(id: string, userId: string) {
  const bilan = await getBilan(id, userId);
  if (!bilan) return;
  const db = supabaseAdmin();
  const { error } = await db.from("bilans").delete().eq("id", id).eq("user_id", userId);
  if (!error) await db.storage.from(BILAN_BUCKET).remove([bilan.pdf_path, bilan.xlsx_path]);
}
