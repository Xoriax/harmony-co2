import { Suspense } from "react";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { getBilanStats } from "@/lib/bilan-stats";
import { pageMetadata } from "@/lib/seo";
import { SiteHeader } from "../../site-header";
import { PageFallback } from "../../page-fallback";
import { BackofficeTabs } from "../tabs";

export const metadata: Metadata = pageMetadata({
  title: "Backoffice · Statistiques",
  description:
    "Nombre de bilans, catégories les plus utilisées et total cumulé, réservés aux administrateurs.",
  path: "/backoffice/statistiques",
  noIndex: true,
});

const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
const TONES = ["bg-leaf", "bg-sky", "bg-gold", "bg-emerald", "bg-blue", "bg-night", "bg-forest"];

function StatCard({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl bg-cream p-5">
      <span className="text-sm font-semibold text-ink/70">{label}</span>
      <span className="font-display text-3xl font-extrabold tabular-nums text-night">
        {value}
        {unit && <span className="ml-1 text-base font-semibold text-ink/60">{unit}</span>}
      </span>
    </div>
  );
}

async function BackofficeStatistiquesContent() {
  await requireAdmin();
  const { stats, error } = await getBilanStats();
  const maxSubtotal = stats.topCategories[0]?.subtotal ?? 0;

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
              Statistiques
            </h1>
            <p className="max-w-[56ch] text-lg text-ink/80">
              Tous les bilans enregistrés dans l&apos;historique, tous utilisateurs confondus.
            </p>
            <BackofficeTabs active="statistiques" />
          </div>
        </section>

        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10">
          {error ? (
            <p
              role="alert"
              className="rounded-2xl border-2 border-red-700/30 bg-red-50 px-5 py-4 font-medium text-red-800"
            >
              {error}
            </p>
          ) : stats.count === 0 ? (
            <p className="text-ink/70">Aucun bilan enregistré pour l&apos;instant.</p>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Bilans enregistrés" value={nf.format(stats.count)} />
                <StatCard
                  label="Total cumulé"
                  value={nf.format(stats.totalEmissions)}
                  unit="kgCO2e"
                />
                <StatCard
                  label="Moyenne par bilan"
                  value={nf.format(stats.averageTotal)}
                  unit="kgCO2e"
                />
              </div>

              <section className="flex flex-col gap-5 rounded-3xl border border-ink/10 bg-cream-soft p-6">
                <h2 className="font-display text-2xl font-bold text-night">
                  Catégories les plus utilisées
                </h2>
                <ul className="flex flex-col gap-4">
                  {stats.topCategories.map((category, i) => {
                    const pct = maxSubtotal > 0 ? (category.subtotal / maxSubtotal) * 100 : 0;
                    return (
                      <li key={category.name} className="flex flex-col gap-1.5">
                        <div className="flex justify-between gap-4 text-sm font-semibold">
                          <span>{category.name}</span>
                          <span className="tabular-nums">
                            {nf.format(category.subtotal)} kgCO2e · {category.count}{" "}
                            {category.count > 1 ? "éléments" : "élément"}
                          </span>
                        </div>
                        <div className="h-3.5 overflow-hidden rounded-full bg-ink/10">
                          <div
                            className={`h-full rounded-full ${TONES[i % TONES.length]}`}
                            style={{ width: `${Math.max(pct, 1.5)}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}

export default function BackofficeStatistiquesPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <BackofficeStatistiquesContent />
    </Suspense>
  );
}
