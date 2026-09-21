import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Les tests tournent dans un fuseau horaire volontairement éloigné de Paris (et à l'heure d'été inversée) :
// si une fonction dépendait du fuseau de la machine, ils échoueraient.
process.env.TZ = "Pacific/Auckland";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(new URL("./tests/stubs/server-only.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    restoreMocks: true,
  },
});
