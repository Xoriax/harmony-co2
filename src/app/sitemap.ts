import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

// Seulement les pages publiques destinées à être indexées : /connexion, /historique et le
// backoffice sont personnelles ou réservées (voir robots.ts et le `noindex` de chacune).
const PAGES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/bilan", changeFrequency: "monthly", priority: 0.9 },
  { path: "/event", changeFrequency: "daily", priority: 0.8 },
  { path: "/mandat", changeFrequency: "monthly", priority: 0.5 },
  { path: "/mentions-legales", changeFrequency: "yearly", priority: 0.2 },
  { path: "/confidentialite", changeFrequency: "yearly", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const lastModified = new Date();

  return PAGES.map(({ path, changeFrequency, priority }) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
