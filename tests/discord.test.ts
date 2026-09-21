import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { authorizeUrl, avatarUrl, isDiscordConfigured, siteUrl } from "@/lib/discord";

const KEYS = [
  "SESSION_SECRET",
  "DISCORD_CLIENT_ID",
  "DISCORD_CLIENT_SECRET",
  "DISCORD_GUILD_ID",
  "DISCORD_ADMIN_ROLE_ID",
  "SITE_URL",
] as const;

const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const key of KEYS) saved[key] = process.env[key];
  process.env.SESSION_SECRET = "secret";
  process.env.DISCORD_CLIENT_ID = "client";
  process.env.DISCORD_CLIENT_SECRET = "client-secret";
  process.env.DISCORD_GUILD_ID = "guild";
  process.env.DISCORD_ADMIN_ROLE_ID = "role";
  delete process.env.SITE_URL;
});

afterEach(() => {
  for (const key of KEYS) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
});

describe("isDiscordConfigured", () => {
  it("est vrai quand tout est renseigné", () => {
    expect(isDiscordConfigured()).toBe(true);
  });

  it.each(KEYS.filter((key) => key !== "SITE_URL"))(
    "est faux si %s manque (la connexion ne peut pas fonctionner)",
    (key) => {
      delete process.env[key];
      expect(isDiscordConfigured()).toBe(false);
    },
  );

  it("est faux si une valeur est vide", () => {
    process.env.DISCORD_GUILD_ID = "";
    expect(isDiscordConfigured()).toBe(false);
  });
});

describe("siteUrl", () => {
  it("vaut localhost par défaut", () => {
    expect(siteUrl()).toBe("http://localhost:3000");
  });

  it("retire les « / » de fin", () => {
    process.env.SITE_URL = "https://harmony.example///";
    expect(siteUrl()).toBe("https://harmony.example");
  });
});

describe("authorizeUrl", () => {
  it("demande uniquement l'identité et l'appartenance au serveur", () => {
    const url = new URL(authorizeUrl("etat-123"));
    expect(url.origin + url.pathname).toBe("https://discord.com/oauth2/authorize");
    expect(url.searchParams.get("client_id")).toBe("client");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("scope")).toBe("identify guilds.members.read");
    expect(url.searchParams.get("state")).toBe("etat-123");
  });

  it("renvoie vers la route de retour du site", () => {
    process.env.SITE_URL = "https://harmony.example";
    expect(new URL(authorizeUrl("x")).searchParams.get("redirect_uri")).toBe(
      "https://harmony.example/connexion/discord/callback",
    );
  });
});

describe("avatarUrl", () => {
  it("construit l'adresse de l'avatar Discord", () => {
    expect(avatarUrl("42/abc")).toBe("https://cdn.discordapp.com/avatars/42/abc.png?size=64");
  });

  it("renvoie null sans avatar", () => {
    expect(avatarUrl(null)).toBeNull();
  });
});
