import { Suspense } from "react";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { listAllBilans } from "@/lib/bilans";
import { pageMetadata } from "@/lib/seo";
import { SiteHeader } from "../../site-header";
import { PageFallback } from "../../page-fallback";
import { BackofficeTabs } from "../tabs";
import AdminBilanList from "./admin-bilan-list";

export const metadata: Metadata = pageMetadata({
  title: "Backoffice · Historique bilan",
  description:
    "Tous les bilans carbone générés, connectés ou non, filtrables par association et par année.",
  path: "/backoffice/historique",
  noIndex: true,
});

const NOTICES: Record<string, string> = {
  missing: "Ce fichier n'existe plus, ou ce bilan n'a pas été trouvé.",
  unavailable: "Le fichier est momentanément indisponible, réessaie dans un instant.",
};

async function BackofficeHistoriqueContent({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireAdmin();
  const { notice } = await searchParams;
  const banner = notice ? NOTICES[notice] : undefined;
  const { bilans, error } = await listAllBilans();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="grain border-b border-ink/10">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-10">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-forest/25 bg-cream-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-forest">
              <span className="h-2 w-2 rounded-full bg-emerald" />
              Backoffice
            </span>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-night sm:text-5xl">
              Historique bilan
            </h1>
            <p className="max-w-[56ch] text-lg text-ink/80">
              Tous les bilans générés sur le site, connectés ou non, filtrables par association et
              par année.
            </p>
            <BackofficeTabs active="historique" />
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
          {error ? (
            <p
              role="alert"
              className="rounded-2xl border-2 border-red-700/30 bg-red-50 px-5 py-4 font-medium text-red-800"
            >
              {error}
            </p>
          ) : bilans.length === 0 ? (
            <p className="text-ink/70">Aucun bilan généré pour l&apos;instant.</p>
          ) : (
            <AdminBilanList bilans={bilans} />
          )}
        </div>
      </main>
    </>
  );
}

export default function BackofficeHistoriquePage(props: {
  searchParams: Promise<{ notice?: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback />}>
      <BackofficeHistoriqueContent {...props} />
    </Suspense>
  );
}
