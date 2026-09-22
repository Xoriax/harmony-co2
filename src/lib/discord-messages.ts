import { formatEventDate } from "./event-format";
import type { WebhookPayload } from "./discord-notify";

const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

// Couleurs de marque (voir src/app/globals.css) : Discord attend un entier, pas un code hexa.
const FOREST = 0x07504a;
const GOLD = 0xe3aa3b;

const clip = (text: string, max: number) =>
  text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;

// Messages postés via les webhooks Discord (voir discord-notify.ts). Fonctions pures, testées
// seules.

export function eventAnnouncementPayload(
  event: {
    title: string;
    description: string;
    location: string;
    starts_at: string;
    ends_at: string;
    cover_url: string | null;
  },
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
        title: clip(`📅 ${event.title}`, 256),
        // Limite Discord : 4096 caractères ; largement suffisant, on garde une marge généreuse.
        description: event.description ? clip(event.description, 2000) : undefined,
        color: FOREST,
        url: `${siteUrl}/event`,
        timestamp: now.toISOString(),
        fields: [
          { name: "Début", value: formatEventDate(event.starts_at), inline: true },
          { name: "Fin", value: formatEventDate(event.ends_at), inline: true },
          { name: "Lieu", value: clip(event.location || "Lieu à préciser", 1024), inline: true },
        ],
        image: event.cover_url ? { url: event.cover_url } : undefined,
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
