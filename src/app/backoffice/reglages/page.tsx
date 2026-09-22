import { Suspense } from "react";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { getSettings } from "@/lib/settings";
import { pageMetadata } from "@/lib/seo";
import { SiteHeader } from "../../site-header";
import { PageFallback } from "../../page-fallback";
import { BackofficeTabs } from "../tabs";
import SettingsForm from "./settings-form";

export const metadata: Metadata = pageMetadata({
  title: "Backoffice · Réglages",
  description:
    "Objectif de bilan carbone, seuil d'alerte Discord et durée de conservation des journaux, réservés aux administrateurs.",
  path: "/backoffice/reglages",
  noIndex: true,
});

async function BackofficeReglagesContent() {
  await requireAdmin();
  const { settings, error } = await getSettings();

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
              Réglages
            </h1>
            <p className="max-w-[56ch] text-lg text-ink/80">
              L&apos;objectif de bilan carbone (comparaison sur la page Bilan), le seuil qui
              déclenche une annonce Discord, et la durée de conservation des journaux.
            </p>
            <BackofficeTabs active="reglages" />
          </div>
        </section>

        <div className="mx-auto max-w-2xl px-5 py-10">
          {error ? (
            <p
              role="alert"
              className="rounded-2xl border-2 border-red-700/30 bg-red-50 px-5 py-4 font-medium text-red-800"
            >
              {error}
            </p>
          ) : (
            <section className="rounded-3xl border-2 border-forest bg-cream-soft p-6">
              <SettingsForm settings={settings} />
            </section>
          )}
        </div>
      </main>
    </>
  );
}

export default function BackofficeReglagesPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <BackofficeReglagesContent />
    </Suspense>
  );
}
