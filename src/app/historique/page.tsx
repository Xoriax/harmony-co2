import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { listBilans } from "@/lib/bilans";
import { getSession } from "@/lib/session";
import { pageMetadata } from "@/lib/seo";
import { GlobeScene } from "../globe-scene";
import { LeafPage } from "../leaf-page";
import { SiteHeader } from "../site-header";
import { PageFallback } from "../page-fallback";
import HistoriqueList from "./historique-list";

export const metadata: Metadata = pageMetadata({
  title: "Mon historique",
  description:
    "Les bilans carbone que tu as générés en étant connecté, à télécharger ou supprimer.",
  path: "/historique",
  noIndex: true,
});

const NOTICES: Record<string, string> = {
  missing: "Ce fichier n'existe plus, ou il ne fait pas partie de tes bilans.",
  unavailable: "Le fichier est momentanément indisponible, réessaie dans un instant.",
};

async function HistoriqueContent({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const session = await getSession();
  if (!session) redirect("/connexion");

  const { notice } = await searchParams;
  const banner = notice ? NOTICES[notice] : undefined;
  const { bilans, error } = await listBilans(session.id);

  return (
    <>
      <SiteHeader />
      <LeafPage seed="historique">
        <section className="grain overflow-hidden border-b border-ink/10">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-10 md:grid-cols-[1.2fr_1fr] md:py-14">
            <div className="flex flex-col gap-4">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-forest/25 bg-cream-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-forest">
                <span className="h-2 w-2 rounded-full bg-emerald" />
                Historique
              </span>
              <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-night [text-wrap:balance] sm:text-5xl">
                Tes bilans{" "}
                <span className="relative whitespace-nowrap text-forest">
                  enregistrés
                  <span className="absolute -bottom-1 left-0 -z-10 h-3 w-full -skew-x-12 rounded-sm bg-leaf/70" />
                </span>
              </h1>
              <p className="max-w-[52ch] text-lg leading-relaxed text-ink/80">
                Chaque bilan généré quand tu es connecté est enregistré ici, avec son PDF, son
                fichier Excel et un export CSV.
              </p>
            </div>
            <div className="hidden w-full max-w-[260px] justify-self-center md:block">
              <GlobeScene small />
            </div>
          </div>
        </section>

        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-10">
          {banner && (
            <p
              role="alert"
              className="rounded-2xl border-2 border-gold/60 bg-gold/20 px-5 py-4 font-medium text-ink"
            >
              {banner}
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="rounded-2xl border-2 border-red-700/30 bg-red-50 px-5 py-4 font-medium text-red-800"
            >
              {error}
            </p>
          )}

          {!error && bilans.length === 0 && (
            <div className="flex flex-col items-start gap-4 rounded-3xl border border-dashed border-ink/25 px-6 py-10">
              <p className="text-lg text-ink/75">Tu n&apos;as pas encore de bilan enregistré.</p>
              <Link
                href="/bilan"
                className="rounded-full bg-forest px-7 py-3 font-semibold text-cream transition-transform hover:-translate-y-0.5"
              >
                Calculer un bilan
              </Link>
            </div>
          )}

          {!error && bilans.length > 0 && <HistoriqueList bilans={bilans} />}
        </div>
      </LeafPage>
    </>
  );
}

export default function HistoriquePage(props: { searchParams: Promise<{ notice?: string }> }) {
  return (
    <Suspense fallback={<PageFallback />}>
      <HistoriqueContent {...props} />
    </Suspense>
  );
}
