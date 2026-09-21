"use server";

import { buildBilan } from "@/lib/bilan-calc";
import { saveBilan } from "@/lib/bilans";
import { CATEGORIES, getCategoryItems } from "@/lib/impactco2";
import { getSession } from "@/lib/session";
import type { BilanInput, BilanResult } from "./types";

export async function computeBilan(input: BilanInput): Promise<BilanResult> {
  const result = await buildBilan(input, {
    categories: CATEGORIES,
    loadItems: (category) => getCategoryItems(CATEGORIES.find((c) => c.slug === category.slug)!),
  });
  if ("error" in result) return result;

  // Connecté : le PDF et l'Excel sont générés et enregistrés automatiquement dans l'historique.
  const session = await getSession();
  if (session) {
    result.history = (await saveBilan({ id: session.id, name: session.name }, result))
      ? "saved"
      : "failed";
  }
  return result;
}
