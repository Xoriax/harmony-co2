import "server-only";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { supabaseAdmin } from "./supabase";

export const MISSING_AUDIT_LOG_TABLE =
  "La table « audit_log » n'existe pas encore : exécute supabase/migrations/20260922_create_audit_log.sql dans le SQL Editor de Supabase.";

export type AuditAction =
  | "login"
  | "logout"
  | "bilan_create"
  | "event_create"
  | "event_update"
  | "event_delete"
  | "mandat_create"
  | "mandat_update"
  | "mandat_delete";

export type AuditLogEntry = {
  id: string;
  action: AuditAction;
  userId: string;
  userName: string;
  targetLabel: string | null;
  createdAt: string;
};

const ACTION_LABELS: Record<AuditAction, string> = {
  login: "Connexion",
  logout: "Déconnexion",
  bilan_create: "Bilan calculé",
  event_create: "Événement créé",
  event_update: "Événement modifié",
  event_delete: "Événement supprimé",
  mandat_create: "Membre du mandat ajouté",
  mandat_update: "Membre du mandat modifié",
  mandat_delete: "Membre du mandat supprimé",
};

export function auditActionLabel(action: AuditAction) {
  return ACTION_LABELS[action] ?? action;
}

// Écrit une entrée dans le journal d'audit. Appelable depuis une Server Action ou une route
// handler (connexion Discord) : on invalide le cache ici même, pas besoin que chaque appelant y
// pense. Une écriture qui échoue (table absente, etc.) ne doit jamais bloquer l'action en cours.
export async function logAudit(
  action: AuditAction,
  user: { id: string; name: string },
  targetLabel?: string | null,
) {
  const { error } = await supabaseAdmin()
    .from("audit_log")
    .insert({ action, user_id: user.id, user_name: user.name, target_label: targetLabel ?? null });
  if (error) {
    console.error("[audit-log] écriture impossible", error.message);
    return;
  }
  revalidateTag("audit-log", "max");
}

// Mis en cache brièvement (le journal doit rester à jour peu après une action) : étiquette
// « audit-log », invalidée par logAudit() à chaque écriture.
async function fetchAuditLog(): Promise<{ entries: AuditLogEntry[]; error: string | null }> {
  "use cache";
  cacheTag("audit-log");

  const { data, error } = await supabaseAdmin()
    .from("audit_log")
    .select("id,action,user_id,user_name,target_label,created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    cacheLife("minutes");
    return {
      entries: [],
      error: error.code === "PGRST205" ? MISSING_AUDIT_LOG_TABLE : "Impossible de lire le journal.",
    };
  }
  cacheLife("minutes");

  return {
    entries: data.map((row) => ({
      id: row.id as string,
      action: row.action as AuditAction,
      userId: row.user_id as string,
      userName: row.user_name as string,
      targetLabel: (row.target_label as string | null) ?? null,
      createdAt: row.created_at as string,
    })),
    error: null,
  };
}

export function getAuditLog() {
  return fetchAuditLog();
}
