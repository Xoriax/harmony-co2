import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Bilan carbone pour les associations`,
    short_name: "Harmony",
    description:
      "Calcule le bilan carbone de ton association en kgCO2e et exporte-le en PDF ou en Excel.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6e9cf", // --cream, voir src/app/globals.css
    theme_color: "#07504a", // --forest
    lang: "fr",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
