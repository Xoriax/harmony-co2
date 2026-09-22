import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";
import { SITE_NAME, pageMetadata, siteUrl } from "@/lib/seo";
import { SiteFooter } from "./site-footer";
import { WebVitals } from "./web-vitals";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  ...pageMetadata({
    title: SITE_NAME,
    description:
      "Bilan carbone pour les associations : calcule ton empreinte en kgCO2e et exporte-la en PDF ou Excel.",
    path: "/",
  }),
  // Après le spread : {default, template} ne s'applique qu'au <title>, pas à openGraph/twitter
  // (déjà posés ci-dessus avec le texte complet par pageMetadata).
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  icons: {
    icon: [
      { url: "/icons/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#07504a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${figtree.variable} ${bricolage.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <WebVitals />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
