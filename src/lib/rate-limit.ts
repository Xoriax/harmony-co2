import "server-only";
import { supabaseAdmin } from "./supabase";

export const MISSING_RATE_LIMITS_TABLE =
  "La table « rate_limits » n'existe pas encore : exécute supabase/migrations/20260922_create_rate_limits.sql dans le SQL Editor de Supabase.";

export type RateLimitResult = { allowed: boolean; count: number; error: string | null };

// Limite `limit` appels par `windowSeconds` pour une clé donnée (ex. "bilan:203.0.113.5").
// Stocké dans Supabase (via une fonction atomique) pour fonctionner même avec plusieurs
// instances serveur. En cas d'erreur (table absente, Supabase indisponible), on autorise par
// défaut : un anti-abus qui casse le site serait pire que l'absence d'anti-abus.
export async function hitRateLimit(
  bucket: string,
  identifier: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const { data, error } = await supabaseAdmin().rpc("rate_limit_hit", {
    p_key: `${bucket}:${identifier}`,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error("[rate-limit] vérification impossible", error.message);
    return {
      allowed: true,
      count: 0,
      error: error.code === "PGRST202" ? MISSING_RATE_LIMITS_TABLE : error.message,
    };
  }
  const count = data as number;
  return { allowed: count <= limit, count, error: null };
}

// Adresse IP du visiteur à partir des en-têtes de la requête (posés par le proxy/l'hébergeur).
// "unknown" en local ou si l'hébergeur ne fournit aucun en-tête : tout le monde partage alors le
// même compteur, ce qui reste acceptable (aucun anti-abus n'est parfait sans IP fiable).
export function clientIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}
