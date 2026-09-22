import type { Metadata } from "next";

export const SITE_NAME = "Harmony CO2";

// Même valeur que SITE_URL utilisée pour Discord (src/lib/discord.ts) : l'URL publique du site,
// sans "/" final.
export function siteUrl() {
  return (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

// Métadonnées communes à une page : titre, description, URL canonique, Open Graph et Twitter Card.
// L'image (og:image) vient toujours du fichier opengraph-image.tsx du segment (ou de celui d'un
// segment parent, par héritage) : Next l'ajoute automatiquement, il ne faut pas la répéter ici.
export function pageMetadata({
  title,
  description,
  path = "/",
  ogTitle = title,
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  ogTitle?: string;
  noIndex?: boolean;
}): Metadata {
  const url = `${siteUrl()}${path}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    ...(noIndex && { robots: { index: false, follow: false } }),
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
    },
  };
}
