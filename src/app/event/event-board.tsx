"use client";

import { useEffect, useMemo, useState } from "react";
import {
  eventEnd,
  eventStatus,
  matchesEventSearch,
  nowParisFull,
  remainingMs,
  type EventRow,
  type EventStatus,
} from "@/lib/event-format";
import EventCard from "./event-card";

const FILTERS: { key: "all" | EventStatus; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "live", label: "En cours" },
  { key: "upcoming", label: "À venir" },
  { key: "ended", label: "Passés" },
];

function Section({ title, events, now }: { title: string; events: EventRow[]; now: string }) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="font-display text-3xl font-bold text-night">{title}</h2>
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((e, i) => (
          <EventCard
            key={e.id}
            index={i}
            event={e}
            status={eventStatus(e, now)}
            remaining={remainingMs(e, now)}
          />
        ))}
      </ul>
    </section>
  );
}

// L'heure démarre à celle du serveur (rendu identique à l'hydratation) puis avance chaque seconde :
// un événement dont la fin est atteinte passe tout seul dans les événements passés.
export default function EventBoard({
  events,
  serverNow,
}: {
  events: EventRow[];
  serverNow: string;
}) {
  const [now, setNow] = useState(serverNow);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");

  useEffect(() => {
    const tick = () => setNow(nowParisFull());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(
    () => events.filter((e) => matchesEventSearch(e, query)),
    [events, query],
  );

  const live = filtered
    .filter((e) => eventStatus(e, now) === "live")
    .sort((a, b) => eventEnd(a).localeCompare(eventEnd(b)));
  const upcoming = filtered.filter((e) => eventStatus(e, now) === "upcoming");
  const past = filtered
    .filter((e) => eventStatus(e, now) === "ended")
    .sort((a, b) => eventEnd(b).localeCompare(eventEnd(a)));

  if (events.length === 0) {
    return <p className="text-ink/70">Aucun événement pour le moment.</p>;
  }

  const showLive = filter === "all" || filter === "live";
  const showUpcoming = filter === "all" || filter === "upcoming";
  const showPast = filter === "all" || filter === "ended";
  const nothingToShow =
    (!showLive || live.length === 0) &&
    (!showUpcoming || upcoming.length === 0) &&
    (!showPast || past.length === 0);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex-1 min-w-48">
          <span className="sr-only">Rechercher un événement</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par titre ou par lieu…"
            className="h-11 w-full max-w-sm rounded-full border border-ink/20 bg-cream-soft px-5 text-ink transition-colors focus:border-blue"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                filter === f.key
                  ? "bg-night text-cream"
                  : "border-2 border-night/30 text-night hover:border-night"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {nothingToShow ? (
        <p className="text-ink/70">Aucun événement ne correspond à ta recherche.</p>
      ) : (
        <>
          {showLive && live.length > 0 && <Section title="En cours" events={live} now={now} />}
          {showUpcoming && upcoming.length > 0 && (
            <Section title="À venir" events={upcoming} now={now} />
          )}
          {showPast && past.length > 0 && (
            <Section title="Événements passés" events={past} now={now} />
          )}
        </>
      )}
    </div>
  );
}
