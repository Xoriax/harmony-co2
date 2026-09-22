import type { BilanComparison } from "@/lib/bilan-comparison";

export type BilanCategory = {
  slug: string;
  name: string;
  items: { ref: string; name: string }[];
};

export type BilanLineInput = {
  ref: string;
  quantity: number;
  trips?: number;
};

export type BilanInput = { categorySlug: string; lines: BilanLineInput[] }[];

export type BilanSuccess = {
  total: number;
  categories: {
    name: string;
    subtotal: number;
    lines: {
      name: string;
      quantity: number;
      unit: string;
      factor: number;
      emissions: number;
    }[];
  }[];
  // Présent seulement si l'utilisateur est connecté : le bilan a-t-il été enregistré dans l'historique ?
  history?: "saved" | "failed";
  // Comparaison à la moyenne des bilans précédents et/ou à l'objectif défini dans le backoffice ;
  // absent si aucun des deux n'est disponible.
  comparison?: BilanComparison;
};

export type BilanResult = { error: string } | BilanSuccess;
