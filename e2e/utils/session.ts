import { createHmac } from "node:crypto";

export type Session = { id: string; name: string; avatar: string | null; admin: boolean };

// Secret utilisé uniquement pour signer les cookies de session injectés dans les tests E2E.
// Doit être identique à celui passé au serveur de développement lancé par Playwright
// (voir playwright.config.ts) : on ne passe jamais par le vrai flux OAuth Discord.
export const E2E_SESSION_SECRET = "e2e-tests-session-secret-do-not-use-in-prod";

export const SESSION_COOKIE = "session";
// Doit rester identique à SESSION_MAX_AGE dans src/lib/session.ts.
const SESSION_MAX_AGE = 60 * 60 * 8;

export const member: Session = { id: "e2e-member", name: "Membre E2E", avatar: null, admin: false };
export const admin: Session = { id: "e2e-admin", name: "Admin E2E", avatar: null, admin: true };

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

// Reproduit exactement le format de buildSessionCookie (src/lib/session.ts), vérifié bit à bit
// par tests/session.test.ts. On ne peut pas importer ce module directement ici : il commence par
// `import "server-only"`, un paquet que seuls le bundler de Next et Vitest (via un alias) savent
// résoudre, pas le chargeur de modules utilisé par Playwright pour son fichier de configuration.
export function buildSessionCookie(session: Session, secret: string = E2E_SESSION_SECRET) {
  const payload = { ...session, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body, secret)}`;
}

// Construit le cookie tel que le navigateur le recevrait après une vraie connexion Discord,
// à injecter avec `context.addCookies([...])` avant de visiter une page.
export function sessionCookie(session: Session, baseURL: string) {
  return {
    name: SESSION_COOKIE,
    value: buildSessionCookie(session),
    domain: new URL(baseURL).hostname,
    path: "/",
    httpOnly: true,
    // Les tests tournent en http://localhost : un cookie "secure" ne serait jamais envoyé.
    secure: false,
    sameSite: "Lax" as const,
  };
}
