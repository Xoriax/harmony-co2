import { Suspense } from "react";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { auditActionLabel, getAuditLog } from "@/lib/audit-log";
import { pageMetadata } from "@/lib/seo";
import { SiteHeader } from "../../site-header";
import { PageFallback } from "../../page-fallback";
import { BackofficeTabs } from "../tabs";

export const metadata: Metadata = pageMetadata({
  title: "Backoffice · Journal",
  description:
    "Connexions, déconnexions, bilans, événements et mandat : l'historique des actions du site.",
  path: "/backoffice/journal",
  noIndex: true,
});

function formatEntryDate(value: string) {
  return new Date(value).toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TONES: Record<string, string> = {
  login: "bg-emerald",
  logout: "bg-ink/30",
  bilan_create: "bg-leaf",
  event_create: "bg-sky",
  event_update: "bg-sky",
  event_delete: "bg-red-600",
  mandat_create: "bg-gold",
  mandat_update: "bg-gold",
  mandat_delete: "bg-red-600",
};

async function BackofficeJournalContent() {
  await requireAdmin();
  const { entries, error } = await getAuditLog();

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
              Journal
            </h1>
            <p className="max-w-[56ch] text-lg text-ink/80">
              Les 200 dernières actions : connexions, déconnexions, bilans calculés, et création /
              modification / suppression des événements et du mandat.
            </p>
            <BackofficeTabs active="journal" />
          </div>
        </section>

        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10">
          {error ? (
            <p
              role="alert"
              className="rounded-2xl border-2 border-red-700/30 bg-red-50 px-5 py-4 font-medium text-red-800"
            >
              {error}
            </p>
          ) : entries.length === 0 ? (
            <p className="text-ink/70">Aucune action enregistrée pour l&apos;instant.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-ink/10 overflow-hidden rounded-3xl border border-ink/10 bg-cream-soft">
              {entries.map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${TONES[entry.action] ?? "bg-ink/30"}`}
                    aria-hidden
                  />
                  <span className="font-semibold text-night">{auditActionLabel(entry.action)}</span>
                  <span className="text-ink/70">{entry.userName}</span>
                  {entry.targetLabel && <span className="text-ink/60">— {entry.targetLabel}</span>}
                  <span className="ml-auto shrink-0 text-sm tabular-nums text-ink/50">
                    {formatEntryDate(entry.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}

export default function BackofficeJournalPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <BackofficeJournalContent />
    </Suspense>
  );
}
