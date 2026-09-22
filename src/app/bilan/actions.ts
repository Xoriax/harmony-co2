"use server";

import { buildBilan } from "@/lib/bilan-calc";
import { buildComparison } from "@/lib/bilan-comparison";
import { listBilans, saveBilan } from "@/lib/bilans";
import { bilanAlertAnnouncement } from "@/lib/discord-messages";
import { postAnnouncement } from "@/lib/discord-notify";
import { CATEGORIES, getCategoryItems } from "@/lib/impactco2";
import { siteUrl } from "@/lib/seo";
import { getSession } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import type { BilanInput, BilanResult } from "./types";

export async function computeBilan(input: BilanInput): Promise<BilanResult> {
  const result = await buildBilan(input, {
    categories: CATEGORIES,
    loadItems: (category) => getCategoryItems(CATEGORIES.find((c) => c.slug === category.slug)!),
  });
  if ("error" in result) return result;

  const [session, { settings }] = await Promise.all([getSession(), getSettings()]);
  const goal = { total: settings.goalTotal, label: settings.goalLabel };

  if (session) {
    // La moyenne des bilans précédents est lue avant l'enregistrement du bilan en cours, pour ne
    // pas s'y comparer lui-même.
    const { bilans: previous } = await listBilans(session.id);
    result.comparison =
      buildComparison(
        result.total,
        previous.map((b) => b.total),
        goal,
      ) ?? undefined;

    // Connecté : le PDF et l'Excel sont générés et enregistrés automatiquement dans l'historique.
    result.history = (await saveBilan({ id: session.id, name: session.name }, result))
      ? "saved"
      : "failed";

    if (settings.alertThreshold !== null && result.total >= settings.alertThreshold) {
      await postAnnouncement(
        bilanAlertAnnouncement(
          { userName: session.name, total: result.total },
          settings.alertThreshold,
          siteUrl(),
        ),
      );
    }
  } else {
    result.comparison = buildComparison(result.total, [], goal) ?? undefined;
  }

  return result;
}
