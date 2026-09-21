import { nowParisFull } from "@/lib/event-format";
import { listEvents } from "@/lib/events";
import { SiteHeader } from "../site-header";
import EventBoard from "./event-board";

export const dynamic = "force-dynamic";

export default async function EventPage() {
  const { events, error } = await listEvents({ publishedOnly: true });

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="grain border-b border-ink/10">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-12">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-forest/25 bg-cream-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-forest">
              <span className="h-2 w-2 rounded-full bg-emerald" />
              Event
            </span>
            <h1 className="font-display text-5xl font-extrabold tracking-tight text-night sm:text-6xl">
              Nos événements
            </h1>
            <p className="max-w-[56ch] text-lg text-ink/80">
              Clique sur une carte pour lire la description de l&apos;événement.
            </p>
          </div>
        </section>

        <div className="mx-auto flex max-w-6xl flex-col gap-14 px-5 py-12">
          {error && (
            <p
              role="alert"
              className="rounded-2xl border-2 border-red-700/30 bg-red-50 px-5 py-4 font-medium text-red-800"
            >
              Impossible de charger les événements, réessaie plus tard.
            </p>
          )}

          {!error && <EventBoard events={events} serverNow={nowParisFull()} />}
        </div>
      </main>
    </>
  );
}
