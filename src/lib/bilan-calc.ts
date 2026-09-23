import type { BilanInput, BilanResult, BilanSuccess } from "@/app/bilan/types";

export type CatalogItem = { ref: string; name: string; factor: number };
export type CategoryInfo = { slug: string; name: string };

export type BilanDeps = {
  categories: CategoryInfo[];
  /** Éléments (avec facteurs d'émission) d'une catégorie ; peut lever si le service est indisponible. */
  loadItems: (category: CategoryInfo) => Promise<CatalogItem[]>;
};

const UNITS: Record<string, string> = {
  alimentation: "repas",
  boisson: "L",
  transport: "km",
};

const MAX_VALUE = 1e9;
export const ASSOCIATION_NAME_MAX = 120;

function isValidNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 && value <= MAX_VALUE;
}

// Seule donnée saisie en dehors des postes d'émission : obligatoire, comme sur les formulaires du
// backoffice (nom d'événement, de membre...).
export function validateAssociationName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Le nom de l'association est obligatoire.";
  if (trimmed.length > ASSOCIATION_NAME_MAX) {
    return `Le nom de l'association ne doit pas dépasser ${ASSOCIATION_NAME_MAX} caractères.`;
  }
  return null;
}

// Calcule le bilan. Le client n'envoie que des références et des quantités : les facteurs
// viennent toujours du catalogue, côté serveur.
export async function buildBilan(input: BilanInput, deps: BilanDeps): Promise<BilanResult> {
  if (!Array.isArray(input) || input.length === 0) {
    return { error: "Sélectionne au moins une catégorie avec un élément." };
  }

  const categories: BilanSuccess["categories"] = [];

  try {
    for (const { categorySlug, lines } of input) {
      const def = deps.categories.find((c) => c.slug === categorySlug);
      if (!def || !Array.isArray(lines)) return { error: "Catégorie invalide." };

      const catalog = new Map((await deps.loadItems(def)).map((i) => [i.ref, i]));
      const results = [];

      for (const line of lines) {
        const item = catalog.get(line.ref);
        if (!item) return { error: "Élément invalide." };

        const trips = line.trips ?? 1;
        if (!isValidNumber(line.quantity) || !isValidNumber(trips)) {
          return { error: `Quantité invalide pour « ${item.name} ».` };
        }

        const isTransport = def.slug === "transport";
        const quantity = isTransport ? line.quantity * trips : line.quantity;
        results.push({
          name: isTransport ? `${item.name} (x${trips})` : item.name,
          quantity,
          unit: UNITS[def.slug] ?? "unité",
          factor: item.factor,
          emissions: quantity * item.factor,
        });
      }

      if (results.length > 0) {
        categories.push({
          name: def.name,
          subtotal: results.reduce((sum, r) => sum + r.emissions, 0),
          lines: results,
        });
      }
    }
  } catch {
    return { error: "Le service Impact CO2 est indisponible, réessaie plus tard." };
  }

  if (categories.length === 0) return { error: "Aucun élément renseigné." };

  return { total: categories.reduce((sum, c) => sum + c.subtotal, 0), categories };
}
