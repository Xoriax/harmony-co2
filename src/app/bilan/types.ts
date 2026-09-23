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

// Envoyé par le formulaire : les catégories à calculer, plus le nom de l'association (seule
// donnée saisie en dehors des postes d'émission).
export type BilanSubmission = { associationName: string; categories: BilanInput };

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

// Bilan calculé et complété par le serveur : le nom de l'association saisi dans le formulaire, et
// l'année de génération (à Paris), non modifiable. C'est ce qui est enregistré, exporté et affiché.
export type BilanRecord = BilanSuccess & { associationName: string; year: number };

export type BilanOutcome = { error: string } | BilanRecord;
