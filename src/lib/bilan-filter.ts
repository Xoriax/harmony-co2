import type { AdminBilanRow, BilanRow } from "./bilans";
import { parisYear } from "./paris-time";

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

export type AdminBilanFilters = { association: string | null; year: number | null };

// Filtre par nom d'association (recherche insensible à la casse) et par année du bilan (à Paris),
// pour /backoffice/historique. Fonction pure, testée seule.
export function matchesAdminBilanFilters(
  bilan: AdminBilanRow,
  filters: AdminBilanFilters,
): boolean {
  const needle = filters.association?.trim().toLowerCase();
  if (needle && !bilan.association_name.toLowerCase().includes(needle)) return false;
  if (filters.year !== null && parisYear(new Date(bilan.created_at)) !== filters.year) {
    return false;
  }
  return true;
}
