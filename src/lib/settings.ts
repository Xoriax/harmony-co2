import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { supabaseAdmin } from "./supabase";

export const MISSING_SETTINGS_TABLE =
  "La table « settings » n'existe pas encore : exécute supabase/migrations/20260922_create_settings.sql dans le SQL Editor de Supabase.";

export type Settings = {
  /** Objectif de bilan carbone (kgCO2e), pour la comparaison affichée sur /bilan. */
  goalTotal: number | null;
  /** Libellé de l'objectif, par exemple « Objectif 2026 ». */
  goalLabel: string | null;
  /** Seuil (kgCO2e) au-delà duquel un bilan déclenche une annonce Discord. */
  alertThreshold: number | null;
};

const DEFAULTS: Settings = { goalTotal: null, goalLabel: null, alertThreshold: null };

// Mis en cache (étiquette « settings »), rafraîchi aussitôt qu'un réglage change depuis le
// backoffice. Utilisé par /bilan (objectif) et par le calcul d'un bilan (seuil d'alerte).
async function fetchSettings(): Promise<{ settings: Settings; error: string | null }> {
  "use cache";
  cacheTag("settings");

  const { data, error } = await supabaseAdmin().from("settings").select("key,value");
  if (error) {
    cacheLife("minutes");
    return {
      settings: DEFAULTS,
      error:
        error.code === "PGRST205" ? MISSING_SETTINGS_TABLE : "Impossible de lire les réglages.",
    };
  }
  cacheLife("hours");

  const map = Object.fromEntries(data.map((row) => [row.key, row.value]));
  const goal = (map.goal ?? {}) as { total?: number; label?: string };
  return {
    settings: {
      goalTotal: typeof goal.total === "number" ? goal.total : null,
      goalLabel: typeof goal.label === "string" ? goal.label : null,
      alertThreshold: typeof map.alert_threshold === "number" ? map.alert_threshold : null,
    },
    error: null,
  };
}

export async function getSettings() {
  return fetchSettings();
}

// Écrit les réglages fournis (les autres restent inchangés). N'invalide pas le cache elle-même :
// l'appelant (une action du backoffice) appelle updateTag("settings") après coup.
export async function saveSettings(patch: {
  goalTotal?: number | null;
  goalLabel?: string | null;
  alertThreshold?: number | null;
}) {
  const db = supabaseAdmin();
  const writes: PromiseLike<{ error: { message: string } | null }>[] = [];

  if (patch.goalTotal !== undefined || patch.goalLabel !== undefined) {
    const { settings: current } = await fetchSettings();
    writes.push(
      db.from("settings").upsert({
        key: "goal",
        value: {
          total: patch.goalTotal !== undefined ? patch.goalTotal : current.goalTotal,
          label: patch.goalLabel !== undefined ? patch.goalLabel : current.goalLabel,
        },
      }),
    );
  }
  if (patch.alertThreshold !== undefined) {
    writes.push(
      db.from("settings").upsert({ key: "alert_threshold", value: patch.alertThreshold }),
    );
  }

  const results = await Promise.all(writes);
  return results.every((r) => !r.error);
}
