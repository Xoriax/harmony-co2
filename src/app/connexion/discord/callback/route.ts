import { NextResponse, type NextRequest } from "next/server";
import { logAudit } from "@/lib/audit-log";
import {
  exchangeCode,
  fetchGuildMember,
  isDiscordConfigured,
  OAUTH_STATE_COOKIE,
  siteUrl,
} from "@/lib/discord";
import { buildSessionCookie } from "@/lib/session";

function redirectTo(path: string) {
  const response = NextResponse.redirect(new URL(path, siteUrl()));
  response.cookies.delete(OAUTH_STATE_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  if (!isDiscordConfigured()) return redirectTo("/connexion?error=config");

  const params = request.nextUrl.searchParams;
  if (params.get("error")) return redirectTo("/connexion?error=denied");

  const code = params.get("code");
  const state = params.get("state");
  const expected = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  if (!code || !state || !expected || state !== expected) {
    return redirectTo("/connexion?error=state");
  }

  const token = await exchangeCode(code);
  if (!token) return redirectTo("/connexion?error=failed");

  const member = await fetchGuildMember(token);
  if (member === "not_member") return redirectTo("/connexion?error=not_member");
  if (member === "error") return redirectTo("/connexion?error=failed");

  const admin = member.roles.includes(process.env.DISCORD_ADMIN_ROLE_ID!);
  const response = redirectTo(admin ? "/backoffice" : "/");
  const { name, value, options } = buildSessionCookie({
    id: member.id,
    name: member.name,
    avatar: member.avatar,
    admin,
  });
  response.cookies.set(name, value, options);
  await logAudit("login", { id: member.id, name: member.name });
  return response;
}
