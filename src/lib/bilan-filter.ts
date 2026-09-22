import type { BilanRow } from "./bilans";

export type BilanFilters = { category: string | null; from: string | null; to: string | null };

// Filtre un bilan de l'historique par catégorie et par plage de dates (AAAA-MM-JJ). Fonction
// pure, testée seule ; un champ à null ou vide n'est pas appliqué.
export function matchesBilanFilters(bilan: BilanRow, filters: BilanFilters): boolean {
  if (filters.category && !bilan.categories.some((c) => c.name === filters.category)) {
    return false;
  }
  const day = bilan.created_at.slice(0, 10);
  if (filters.from && day < filters.from) return false;
  if (filters.to && day > filters.to) return false;
  return true;
}
