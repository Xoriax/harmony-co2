import { defineConfig, devices } from "@playwright/test";
import { E2E_SESSION_SECRET } from "./e2e/utils/session";

// Port dédié aux tests, différent de celui de `npm run dev` (3000) : les deux serveurs peuvent
// tourner en même temps, et Playwright ne risque jamais de réutiliser un serveur déjà lancé avec
// un autre SESSION_SECRET que celui fixé ci-dessous pour signer les cookies de test.
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3100";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",

  use: {
    baseURL,
    trace: "on-first-retry",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  // Un vrai build (pas `next dev`) : plus rapide par requête et surtout plus stable avec
  // plusieurs tests en parallèle (le mode développement recompile à la volée, ce qui a rendu le
  // test de déconnexion ponctuellement instable). Mêmes variables d'environnement que
  // `npm run build` (Next lit le .env local), sauf SESSION_SECRET, fixé pour que les cookies
  // signés par les tests soient acceptés par le serveur.
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run build && npm run start -- -p 3100",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        env: { ...process.env, SESSION_SECRET: E2E_SESSION_SECRET },
      },
});
