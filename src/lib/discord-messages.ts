import { formatEventDate } from "./event-format";

const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

// Messages postés dans le salon d'annonces Discord (voir discord-notify.ts). Fonctions pures,
// testées seules.

export function eventAnnouncement(
  event: { title: string; location: string; starts_at: string },
  siteUrl: string,
): string {
  return [
    `📅 **Nouvel événement : ${event.title}**`,
    `🗓️ ${formatEventDate(event.starts_at)}`,
    `📍 ${event.location || "Lieu à préciser"}`,
    `${siteUrl}/event`,
  ].join("\n");
}

export function bilanAlertAnnouncement(
  bilan: { userName: string; total: number },
  threshold: number,
  siteUrl: string,
): string {
  return [
    "⚠️ **Bilan carbone important**",
    `${bilan.userName} vient de calculer un bilan de **${nf.format(bilan.total)} kgCO2e** (seuil : ${nf.format(threshold)} kgCO2e).`,
    `${siteUrl}/historique`,
  ].join("\n");
}
