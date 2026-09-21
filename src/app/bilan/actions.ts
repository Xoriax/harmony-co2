"use server";

import { saveBilan } from "@/lib/bilans";
import { CATEGORIES, getCategoryItems } from "@/lib/impactco2";
import { getSession } from "@/lib/session";
import type { BilanInput, BilanResult, BilanSuccess } from "./types";

const UNITS: Record<string, string> = {
  alimentation: "repas",
  boisson: "L",
  transport: "km",
};

const MAX_VALUE = 1e9;

function isValidNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 && value <= MAX_VALUE;
}

export async function computeBilan(input: BilanInput): Promise<BilanResult> {
  if (!Array.isArray(input) || input.length === 0) {
    return { error: "Sélectionne au moins une catégorie avec un élément." };
  }

  const categories: BilanSuccess["categories"] = [];

  try {
    // Le client n'envoie que des références et des quantités : les facteurs
    // viennent toujours de l'API, côté serveur.
    for (const { categorySlug, lines } of input) {
      const def = CATEGORIES.find((c) => c.slug === categorySlug);
      if (!def || !Array.isArray(lines)) return { error: "Catégorie invalide." };

      const catalog = new Map((await getCategoryItems(def)).map((i) => [i.ref, i]));
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

  const result: BilanSuccess = {
    total: categories.reduce((sum, c) => sum + c.subtotal, 0),
    categories,
  };

  // Connecté : le PDF et l'Excel sont générés et enregistrés automatiquement dans l'historique.
  const session = await getSession();
  if (session) {
    result.history = (await saveBilan({ id: session.id, name: session.name }, result))
      ? "saved"
      : "failed";
  }
  return result;
}
