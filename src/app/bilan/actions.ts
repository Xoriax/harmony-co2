"use server";

import { headers } from "next/headers";
import { logAudit } from "@/lib/audit-log";
import { buildBilan, validateAssociationName } from "@/lib/bilan-calc";
import { buildComparison } from "@/lib/bilan-comparison";
import { ANONYMOUS_USER_ID, ANONYMOUS_USER_NAME, listBilans, saveBilan } from "@/lib/bilans";
import { bilanAlertPayload } from "@/lib/discord-messages";
import { postBilanAlert } from "@/lib/discord-notify";
import { CATEGORIES, getCategoryItems } from "@/lib/impactco2";
import { parisYear } from "@/lib/paris-time";
import { clientIp, hitRateLimit } from "@/lib/rate-limit";
import { siteUrl } from "@/lib/seo";
import { getSession } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import type { BilanOutcome, BilanRecord, BilanSubmission } from "./types";

const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

// Au-delà, l'API Impact CO2 est appelée en pure perte : mieux vaut refuser que la faire spammer.
const BILAN_LIMIT = 20;
const BILAN_WINDOW_SECONDS = 10 * 60;

export async function computeBilan(submission: BilanSubmission): Promise<BilanOutcome> {
  const nameError = validateAssociationName(submission.associationName);
  if (nameError) return { error: nameError };

  const ip = clientIp(await headers());
  const { allowed } = await hitRateLimit("bilan", ip, BILAN_LIMIT, BILAN_WINDOW_SECONDS);
  if (!allowed) {
    return { error: "Trop de calculs en peu de temps. Réessaie dans quelques minutes." };
  }

  const result = await buildBilan(submission.categories, {
    categories: CATEGORIES,
    loadItems: (category) => getCategoryItems(CATEGORIES.find((c) => c.slug === category.slug)!),
  });
  if ("error" in result) return result;

  // Année du bilan : dérivée de la date de génération (à Paris), non modifiable.
  const record: BilanRecord = {
    ...result,
    associationName: submission.associationName.trim(),
    year: parisYear(),
  };

  const [session, { settings }] = await Promise.all([getSession(), getSettings()]);
  const goal = { total: settings.goalTotal, label: settings.goalLabel };

  if (session) {
    // La moyenne des bilans précédents est lue avant l'enregistrement du bilan en cours, pour ne
    // pas s'y comparer lui-même.
    const { bilans: previous } = await listBilans(session.id);
    record.comparison =
      buildComparison(
        record.total,
        previous.map((b) => b.total),
        goal,
      ) ?? undefined;
  } else {
    record.comparison = buildComparison(record.total, [], goal) ?? undefined;
  }

  // Le PDF et l'Excel sont générés et enregistrés pour tout le monde, connecté ou non : sans
  // connexion, le bilan reste consultable par les administrateurs (/backoffice/historique) mais ne
  // rejoint l'historique personnel de personne, faute de session à laquelle le rattacher.
  const author = session ?? { id: ANONYMOUS_USER_ID, name: ANONYMOUS_USER_NAME };
  const saved = await saveBilan(author, record);
  if (session) {
    record.history = saved ? "saved" : "failed";
    if (saved) await logAudit("bilan_create", session, `${nf.format(record.total)} kgCO2e`);
  }

  if (settings.alertThreshold !== null && record.total >= settings.alertThreshold) {
    await postBilanAlert(
      bilanAlertPayload(
        { userName: session?.name ?? ANONYMOUS_USER_NAME, total: record.total },
        settings.alertThreshold,
        siteUrl(),
      ),
    );
  }

  return record;
}
