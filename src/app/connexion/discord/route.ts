import { randomBytes } from "node:crypto";
import { connection, NextResponse } from "next/server";
import { authorizeUrl, isDiscordConfigured, OAUTH_STATE_COOKIE, siteUrl } from "@/lib/discord";

// Démarre la connexion : redirige vers Discord avec un état anti-CSRF stocké en cookie.
export async function GET() {
  // Toujours au moment de la requête : l'état anti-CSRF doit être neuf à chaque connexion.
  await connection();
  if (!isDiscordConfigured()) {
    return NextResponse.redirect(new URL("/connexion?error=config", siteUrl()));
  }

  const state = randomBytes(16).toString("hex");
  const response = NextResponse.redirect(authorizeUrl(state));
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return response;
}
