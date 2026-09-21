import "server-only";

const API = "https://discord.com/api";

export const OAUTH_STATE_COOKIE = "oauth_state";

export function siteUrl() {
  return (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

export function isDiscordConfigured() {
  return Boolean(
    process.env.DISCORD_CLIENT_ID &&
      process.env.DISCORD_CLIENT_SECRET &&
      process.env.DISCORD_GUILD_ID &&
      process.env.DISCORD_ADMIN_ROLE_ID,
  );
}

const redirectUri = () => `${siteUrl()}/connexion/discord/callback`;

export function authorizeUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    response_type: "code",
    redirect_uri: redirectUri(),
    scope: "identify guilds.members.read",
    state,
    prompt: "none",
  });
  return `https://discord.com/oauth2/authorize?${params}`;
}

export async function exchangeCode(code: string): Promise<string | null> {
  const res = await fetch(`${API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(),
    }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

export type GuildMember = {
  id: string;
  name: string;
  avatar: string | null;
  roles: string[];
};

// Renvoie le membre du serveur ciblé, "not_member" si le compte n'y est pas, "error" sinon.
export async function fetchGuildMember(
  accessToken: string,
): Promise<GuildMember | "not_member" | "error"> {
  const res = await fetch(`${API}/users/@me/guilds/${process.env.DISCORD_GUILD_ID}/member`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (res.status === 404) return "not_member";
  if (!res.ok) return "error";

  const data = (await res.json()) as {
    nick?: string | null;
    roles?: string[];
    user?: { id: string; username: string; global_name?: string | null; avatar?: string | null };
  };
  if (!data.user) return "error";

  return {
    id: data.user.id,
    name: data.nick || data.user.global_name || data.user.username,
    avatar: data.user.avatar ? `${data.user.id}/${data.user.avatar}` : null,
    roles: data.roles ?? [],
  };
}

export const avatarUrl = (avatar: string | null) =>
  avatar ? `https://cdn.discordapp.com/avatars/${avatar}.png?size=64` : null;
