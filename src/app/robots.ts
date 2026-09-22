import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Backoffice (réservé aux administrateurs) et routes techniques : rien à indexer.
      disallow: ["/backoffice", "/api/"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
