export type VitalsMetric = { name: string; value: number; rating: string; path: string };

const METRICS = new Set(["CLS", "FCP", "FID", "INP", "LCP", "TTFB"]);
const RATINGS = new Set(["good", "needs-improvement", "poor"]);
const MAX_PATH = 200;

// Valide la mesure envoyée par le navigateur (voir web-vitals.tsx) ; renvoie null si elle est
// malformée ou falsifiée, sans jamais faire confiance à l'entrée. Aucun champ ne permet
// d'identifier un visiteur : juste une métrique, sa valeur, son verdict et la page concernée.
export function parseVitalsMetric(body: unknown): VitalsMetric | null {
  if (typeof body !== "object" || body === null) return null;
  const { name, value, rating, path } = body as Record<string, unknown>;

  if (typeof name !== "string" || !METRICS.has(name)) return null;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return null;
  if (typeof rating !== "string" || !RATINGS.has(rating)) return null;
  if (typeof path !== "string" || path.length === 0) return null;

  return { name, value, rating, path: path.slice(0, MAX_PATH) };
}
