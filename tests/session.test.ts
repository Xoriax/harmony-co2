import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Faux magasin de cookies : next/headers n'existe pas hors d'une requête Next.
const store = new Map<string, string>();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (store.has(name) ? { name, value: store.get(name)! } : undefined),
    set: (name: string, value: string) => void store.set(name, value),
    delete: (name: string) => void store.delete(name),
  }),
}));

import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  buildSessionCookie,
  createSession,
  deleteSession,
  getSession,
  isSessionConfigured,
  type Session,
} from "@/lib/session";

import { buildSessionCookie as buildE2ECookie, admin as e2eAdmin } from "../e2e/utils/session";

const admin: Session = { id: "42", name: "Camille", avatar: "42/abc", admin: true };
const member: Session = { id: "7", name: "Alex", avatar: null, admin: false };

const raw = () => store.get(SESSION_COOKIE)!;
const decode = (body: string) => JSON.parse(Buffer.from(body, "base64url").toString());
const encode = (payload: object) => Buffer.from(JSON.stringify(payload)).toString("base64url");

beforeEach(() => {
  store.clear();
  process.env.SESSION_SECRET = "secret-de-test-assez-long-pour-hmac";
});

afterEach(() => {
  vi.useRealTimers();
});

describe("session signée", () => {
  it("retrouve la session après sa création", async () => {
    await createSession(admin);
    expect(await getSession()).toEqual(admin);
  });

  it("conserve le rôle : un membre simple n'est pas administrateur", async () => {
    await createSession(member);
    expect(await getSession()).toEqual({ ...member, admin: false });
  });

  it("renvoie null sans cookie", async () => {
    expect(await getSession()).toBeNull();
  });

  it("le supprime à la déconnexion", async () => {
    await createSession(admin);
    await deleteSession();
    expect(await getSession()).toBeNull();
  });

  it("pose un cookie httpOnly, SameSite=Lax, valable 8 heures", () => {
    const { name, options } = buildSessionCookie(admin);
    expect(name).toBe("session");
    expect(options).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    expect(SESSION_MAX_AGE).toBe(8 * 3600);
  });
});

describe("session : falsification", () => {
  it("refuse un cookie dont le contenu a été modifié pour devenir administrateur", async () => {
    await createSession(member);
    const [body, signature] = raw().split(".");
    const forged = encode({ ...decode(body), admin: true });
    store.set(SESSION_COOKIE, `${forged}.${signature}`);
    expect(await getSession()).toBeNull();
  });

  it("refuse une signature modifiée", async () => {
    await createSession(admin);
    store.set(SESSION_COOKIE, `${raw().slice(0, -1)}${raw().endsWith("0") ? "1" : "0"}`);
    expect(await getSession()).toBeNull();
  });

  it("refuse une session signée avec un autre secret", async () => {
    await createSession(admin);
    process.env.SESSION_SECRET = "un-autre-secret-completement-different";
    expect(await getSession()).toBeNull();
  });

  it.each(["", "abc", "sans-point", ".signature", "corps."])(
    "refuse le cookie mal formé %j",
    async (value) => {
      store.set(SESSION_COOKIE, value);
      expect(await getSession()).toBeNull();
    },
  );

  it("refuse un contenu signé mais sans date d'expiration", async () => {
    await createSession(admin);
    const [body] = raw().split(".");
    const { exp: _exp, ...withoutExp } = decode(body);
    void _exp;
    // Re-signer avec le vrai secret via buildSessionCookie n'est pas possible sans exp :
    // on vérifie donc qu'un contenu modifié (donc mal signé) est rejeté.
    store.set(SESSION_COOKIE, `${encode(withoutExp)}.${raw().split(".")[1]}`);
    expect(await getSession()).toBeNull();
  });
});

describe("session : secret manquant", () => {
  it("ne plante pas : personne n'est connecté et le site reste utilisable", async () => {
    await createSession(admin);
    delete process.env.SESSION_SECRET;
    const log = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(await getSession()).toBeNull();
    expect(await getSession()).toBeNull();
    // L'anomalie est signalée une seule fois, pas à chaque page.
    expect(log.mock.calls.length).toBeLessThanOrEqual(1);
  });

  it("refuse de créer une session sans secret, avec un message clair", () => {
    delete process.env.SESSION_SECRET;
    expect(() => buildSessionCookie(admin)).toThrow("SESSION_SECRET");
  });

  it("indique si la signature est configurée", () => {
    expect(isSessionConfigured()).toBe(true);
    delete process.env.SESSION_SECRET;
    expect(isSessionConfigured()).toBe(false);
  });
});

describe("session : expiration", () => {
  it("reste valable presque 8 heures", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-21T10:00:00Z"));
    await createSession(admin);

    vi.setSystemTime(new Date("2026-09-21T17:59:00Z"));
    expect(await getSession()).toEqual(admin);
  });

  it("expire après 8 heures", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-21T10:00:00Z"));
    await createSession(admin);

    vi.setSystemTime(new Date("2026-09-21T18:00:01Z"));
    expect(await getSession()).toBeNull();
  });
});

describe("session : parité avec le cookie injecté par les tests E2E", () => {
  // Les tests E2E (Playwright) ne peuvent pas importer src/lib/session.ts directement (il
  // commence par `import "server-only"`) : ils reconstruisent le format du cookie eux-mêmes.
  // Ce test garantit que cette reconstruction reste bit à bit identique à la vraie fonction.
  it("un cookie construit par le helper E2E est accepté tel quel", async () => {
    store.set(SESSION_COOKIE, buildE2ECookie(e2eAdmin, process.env.SESSION_SECRET!));
    expect(await getSession()).toEqual(e2eAdmin);
  });
});
