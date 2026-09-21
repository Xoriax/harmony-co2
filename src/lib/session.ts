import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "session";
const MAX_AGE = 60 * 60 * 8;

function sign(value: string) {
  return createHmac("sha256", process.env.SESSION_SECRET!)
    .update(value)
    .digest("hex");
}

export async function createSession(user: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, `${user}.${sign(user)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getSession() {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const [user, signature] = raw.split(".");
  if (!user || !signature) return null;

  const expected = Buffer.from(sign(user));
  const received = Buffer.from(signature);
  if (expected.length !== received.length) return null;
  return timingSafeEqual(expected, received) ? { user } : null;
}

export async function deleteSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
