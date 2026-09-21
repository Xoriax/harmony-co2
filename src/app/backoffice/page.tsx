import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { eventStatus, formatEventDate, nowParisFull } from "@/lib/event-format";
import { getEvent, listEvents } from "@/lib/events";
import { getSession } from "@/lib/session";
import { SiteHeader } from "../site-header";
import DeleteEventButton from "./delete-event-button";
import EventForm from "./event-form";

export default async function BackofficePage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  if (!(await getSession())) redirect("/connexion");

  const { edit } = await searchParams;
  const [{ events, error }, editing] = await Promise.all([
    listEvents(),
    edit ? getEvent(edit) : Promise.resolve(null),
  ]);
  const now = nowParisFull();

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
              Gérer les événements
            </h1>
            <p className="max-w-[56ch] text-lg text-ink/80">
              Crée, modifie ou supprime les événements. Ceux qui sont publiés
              apparaissent sur la page Event.
            </p>
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl items-start gap-8 px-5 py-10 lg:grid-cols-[380px_1fr]">
          <section className="rounded-3xl border-2 border-forest bg-cream-soft p-6 lg:sticky lg:top-24">
            <h2 className="mb-5 font-display text-2xl font-bold text-night">
              {editing ? "Modifier l'événement" : "Nouvel événement"}
            </h2>
            <EventForm key={editing?.id ?? "new"} event={editing ?? undefined} />
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-display text-2xl font-bold text-night">
              Événements <span className="text-ink/50">({events.length})</span>
            </h2>

            {error && (
              <p
                role="alert"
                className="rounded-2xl border-2 border-red-700/30 bg-red-50 px-5 py-4 font-medium text-red-800"
              >
                {error}
              </p>
            )}

            {!error && events.length === 0 && (
              <p className="rounded-2xl border border-dashed border-ink/25 px-5 py-8 text-center text-ink/70">
                Aucun événement pour l&apos;instant. Crée le premier avec le formulaire.
              </p>
            )}

            <ul className="flex flex-col gap-4">
              {events.map((e) => {
                const status = eventStatus(e, now);
                return (
                  <li
                    key={e.id}
                    className={`flex flex-col gap-3 rounded-3xl border-2 bg-cream-soft p-5 ${
                      editing?.id === e.id ? "border-blue" : "border-ink/10"
                    }`}
                  >
                    {e.cover_url && (
                      <div className="relative aspect-[16/6] overflow-hidden rounded-2xl bg-black">
                        <Image
                          src={e.cover_url}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 700px, 100vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          e.published ? "bg-emerald/25 text-forest" : "bg-gold/30 text-ink"
                        }`}
                      >
                        {e.published ? "Publié" : "Brouillon"}
                      </span>
                      {status === "live" && (
                        <span className="rounded-full bg-emerald px-3 py-1 text-xs font-semibold text-ink">
                          En cours
                        </span>
                      )}
                      {status === "ended" && (
                        <span className="rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold text-ink/70">
                          Clos
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-night">{e.title}</h3>
                      <p className="text-sm font-medium capitalize text-forest">
                        {formatEventDate(e.starts_at)}
                        {e.location && (
                          <span className="normal-case text-ink/70"> · {e.location}</span>
                        )}
                      </p>
                    </div>
                    {e.description && <p className="line-clamp-2 text-ink/75">{e.description}</p>}
                    <div className="flex flex-wrap gap-3 pt-1">
                      <Link
                        href={`/backoffice?edit=${e.id}`}
                        className="flex h-10 items-center rounded-full border-2 border-night/80 px-4 text-sm font-semibold text-night transition-colors hover:bg-night hover:text-cream"
                      >
                        Modifier
                      </Link>
                      <DeleteEventButton id={e.id} title={e.title} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}
