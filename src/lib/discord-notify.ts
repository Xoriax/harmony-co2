import "server-only";

const API = "https://discord.com/api/v10";

export function isAnnounceConfigured() {
  return Boolean(process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_ANNOUNCE_CHANNEL_ID);
}

// Poste un message dans le salon d'annonces Discord. Le bot doit y avoir la permission
// « Envoyer des messages » (en plus de « Gérer les événements », déjà nécessaire pour synchroniser
// les événements programmés) : sans elle, Discord répond 403 et l'appel échoue silencieusement
// (l'anomalie est journalisée, jamais montrée au visiteur).
export async function postAnnouncement(content: string): Promise<boolean> {
  if (!isAnnounceConfigured()) return false;

  try {
    const res = await fetch(`${API}/channels/${process.env.DISCORD_ANNOUNCE_CHANNEL_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[discord] annonce refusée (${res.status})`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[discord] annonce impossible", error instanceof Error ? error.message : error);
    return false;
  }
}
