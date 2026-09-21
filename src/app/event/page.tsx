import { Suspense } from "react";
import { connection } from "next/server";
import { nowParisFull } from "@/lib/event-format";
import { listEvents } from "@/lib/events";
import { LeafPage } from "../leaf-page";
import { SiteHeader } from "../site-header";
import { GlobeScene } from "../globe-scene";
import EventBoard from "./event-board";

// Bloc rendu à chaque requête : les statuts (en cours, à venir, passé) dépendent de l'heure exacte.
// La liste elle-même vient du cache ; le reste de la page est prérendu.
async function EventsSection() {
  await connection();
  const { events, error } = await listEvents({ publishedOnly: true });

  return (
    <>
      {error && (
        <p
          role="alert"
          className="rounded-2xl border-2 border-red-700/30 bg-red-50 px-5 py-4 font-medium text-red-800"
        >
          Impossible de charger les événements, réessaie plus tard.
        </p>
      )}
      {!error && <EventBoard events={events} serverNow={nowParisFull()} />}
    </>
  );
}

function EventsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[30rem] animate-pulse rounded-3xl bg-ink/10" />
      ))}
    </div>
  );
}

export default function EventPage() {
  return (
    <>
      <SiteHeader />
      <LeafPage>
        <section className="grain overflow-hidden border-b border-ink/10">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-12 md:grid-cols-[1.2fr_1fr] md:py-16">
            <div className="flex flex-col gap-5">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-forest/25 bg-cream-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-forest">
                <span className="h-2 w-2 rounded-full bg-emerald" />
                Event
              </span>
              <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-night [text-wrap:balance] sm:text-6xl">
                Nos{" "}
                <span className="relative whitespace-nowrap text-forest">
                  événements
                  <span className="absolute -bottom-1 left-0 -z-10 h-3 w-full -skew-x-12 rounded-sm bg-leaf/70" />
                </span>
              </h1>
              <p className="max-w-[48ch] text-lg leading-relaxed text-ink/80">
                Clique sur une carte pour la retourner et lire la description de l&apos;événement.
              </p>
            </div>
            <div className="hidden w-full max-w-[300px] justify-self-center md:block">
              <GlobeScene small />
            </div>
          </div>
        </section>

        <div className="mx-auto flex max-w-6xl flex-col gap-14 px-5 py-12">
          <Suspense fallback={<EventsSkeleton />}>
            <EventsSection />
          </Suspense>
        </div>
      </LeafPage>
    </>
  );
}
