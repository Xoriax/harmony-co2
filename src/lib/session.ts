import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = 60 * 60 * 8;

export type Session = {
  id: string;
  name: string;
  avatar: string | null;
  admin: boolean;
};

type Payload = Session & { exp: number };

function sign(value: string) {
  return createHmac("sha256", process.env.SESSION_SECRET!).update(value).digest("hex");
}

// Cookie signé (HMAC) contenant la session et sa date d'expiration.
export function buildSessionCookie(session: Session) {
  const payload: Payload = {
    ...session,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return {
    name: SESSION_COOKIE,
    value: `${body}.${sign(body)}`,
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    },
  };
}

export async function createSession(session: Session) {
  const { name, value, options } = buildSessionCookie(session);
  (await cookies()).set(name, value, options);
}

export async function getSession(): Promise<Session | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const dot = raw.lastIndexOf(".");
  if (dot < 1) return null;
  const body = raw.slice(0, dot);

  const expected = Buffer.from(sign(body));
  const received = Buffer.from(raw.slice(dot + 1));
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as Payload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now() / 1000) return null;
    return {
      id: String(payload.id),
      name: String(payload.name),
      avatar: payload.avatar ? String(payload.avatar) : null,
      admin: payload.admin === true,
    };
  } catch {
    return null;
  }
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
