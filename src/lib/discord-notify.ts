import "server-only";

type DiscordEmbed = {
  title: string;
  description?: string;
  color: number;
  url?: string;
  timestamp?: string;
  fields?: { name: string; value: string; inline?: boolean }[];
  image?: { url: string };
};

export type WebhookPayload = {
  content?: string;
  embeds: DiscordEmbed[];
  // Liste blanche explicite des mentions à activer : plus sûr qu'un simple `<@&id>` dans le
  // texte, qui ne notifierait personne sans ça.
  allowed_mentions?: { roles?: string[] };
};

// Deux salons, deux webhooks : les événements sont publics (salon annonces), les alertes de
// bilan réservées aux administrateurs (salon log-bilan, visible uniquement par leur rôle). Un
// webhook Discord se crée dans Réglages du salon > Intégrations > Webhooks, sans toucher aux
// permissions du bot.
export function isEventsWebhookConfigured() {
  return Boolean(process.env.DISCORD_EVENTS_WEBHOOK_URL);
}
export function isBilanAlertWebhookConfigured() {
  return Boolean(process.env.DISCORD_BILAN_ALERT_WEBHOOK_URL);
}

async function postWebhook(url: string | undefined, payload: WebhookPayload): Promise<boolean> {
  if (!url) return false;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[discord] webhook refusé (${res.status})`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[discord] webhook impossible", error instanceof Error ? error.message : error);
    return false;
  }
}

export function postEventAnnouncement(payload: WebhookPayload) {
  return postWebhook(process.env.DISCORD_EVENTS_WEBHOOK_URL, payload);
}

export function postBilanAlert(payload: WebhookPayload) {
  return postWebhook(process.env.DISCORD_BILAN_ALERT_WEBHOOK_URL, payload);
}
