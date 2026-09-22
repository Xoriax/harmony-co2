import { formatEventDate } from "./event-format";
import type { WebhookPayload } from "./discord-notify";

const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

// Couleurs de marque (voir src/app/globals.css) : Discord attend un entier, pas un code hexa.
const FOREST = 0x07504a;
const GOLD = 0xe3aa3b;

// Messages postés via les webhooks Discord (voir discord-notify.ts). Fonctions pures, testées
// seules.

export function eventAnnouncementPayload(
  event: { title: string; location: string; starts_at: string },
  siteUrl: string,
  roleId: string | null,
  now: Date = new Date(),
): WebhookPayload {
  return {
    // La mention doit être dans `content` pour notifier : un rôle cité dans un embed ne ping
    // personne.
    content: roleId ? `<@&${roleId}>` : undefined,
    allowed_mentions: roleId ? { roles: [roleId] } : undefined,
    embeds: [
      {
        title: `📅 ${event.title}`,
        description: `🗓️ ${formatEventDate(event.starts_at)}\n📍 ${event.location || "Lieu à préciser"}`,
        color: FOREST,
        url: `${siteUrl}/event`,
        timestamp: now.toISOString(),
      },
    ],
  };
}

export function bilanAlertPayload(
  bilan: { userName: string; total: number },
  threshold: number,
  siteUrl: string,
  now: Date = new Date(),
): WebhookPayload {
  return {
    embeds: [
      {
        title: "⚠️ Bilan carbone important",
        description: `${bilan.userName} vient de calculer un bilan de **${nf.format(bilan.total)} kgCO2e** (seuil : ${nf.format(threshold)} kgCO2e).`,
        color: GOLD,
        url: `${siteUrl}/historique`,
        timestamp: now.toISOString(),
      },
    ],
  };
}
