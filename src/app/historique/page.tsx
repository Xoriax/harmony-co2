import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { listBilans } from "@/lib/bilans";
import { getSession } from "@/lib/session";
import { GlobeScene } from "../globe-scene";
import { LeafPage } from "../leaf-page";
import { SiteHeader } from "../site-header";
import { PageFallback } from "../page-fallback";
import TiltCard from "../tilt-card";
import DeleteBilanButton from "./delete-bilan-button";

const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

const TONES = ["bg-leaf", "bg-sky", "bg-gold", "bg-emerald", "bg-blue", "bg-night", "bg-forest"];

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "Europe/Paris",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const linkClass =
  "flex h-10 items-center rounded-full border-2 border-night/80 px-5 text-sm font-semibold text-night transition-colors hover:bg-night hover:text-cream";

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
                Chaque bilan généré quand tu es connecté est enregistré ici, avec son PDF et son
                fichier Excel.
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

          <ul className="flex flex-col gap-5">
            {bilans.map((b, index) => (
              <li
                key={b.id}
                className="rise"
                style={{ animationDelay: `${Math.min(index, 8) * 80}ms` }}
              >
                <TiltCard
                  strength={0.35}
                  className="grid gap-5 rounded-3xl border border-ink/10 bg-cream-soft p-6 md:grid-cols-[auto_1fr_auto] md:items-center"
                >
                  <div className="depth-1 flex flex-col">
                    <span className="font-display text-4xl font-extrabold tabular-nums text-night">
                      {nf.format(b.total)}
                    </span>
                    <span className="text-sm font-semibold text-forest">kgCO2e</span>
                  </div>
                  <div className="depth-2 flex min-w-0 flex-col gap-3">
                    <p className="text-sm font-medium capitalize text-ink/75">
                      {dateFormat.format(new Date(b.created_at))}
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {b.categories.map((c, i) => (
                        <li
                          key={c.name}
                          className="flex items-center gap-2 rounded-full bg-cream px-3 py-1 text-xs font-semibold"
                        >
                          <span className={`h-2.5 w-2.5 rounded-full ${TONES[i % TONES.length]}`} />
                          {c.name} · {nf.format(c.subtotal)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="depth-2 flex flex-wrap gap-3">
                    {/* Liens classiques : la route redirige vers une URL de téléchargement signée. */}
                    <a href={`/historique/fichier/${b.id}?format=pdf`} className={linkClass}>
                      PDF
                    </a>
                    <a href={`/historique/fichier/${b.id}?format=xlsx`} className={linkClass}>
                      Excel
                    </a>
                    <DeleteBilanButton id={b.id} />
                  </div>
                </TiltCard>
              </li>
            ))}
          </ul>
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
