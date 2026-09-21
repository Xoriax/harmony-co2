"use client";

import { useEffect, useState } from "react";
import {
  eventEnd,
  eventStatus,
  nowParisFull,
  remainingMs,
  type EventRow,
} from "@/lib/event-format";
import EventCard from "./event-card";

function Section({
  title,
  events,
  now,
}: {
  title: string;
  events: EventRow[];
  now: string;
}) {
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

  useEffect(() => {
    const tick = () => setNow(nowParisFull());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const live = events
    .filter((e) => eventStatus(e, now) === "live")
    .sort((a, b) => eventEnd(a).localeCompare(eventEnd(b)));
  const upcoming = events.filter((e) => eventStatus(e, now) === "upcoming");
  const past = events
    .filter((e) => eventStatus(e, now) === "ended")
    .sort((a, b) => eventEnd(b).localeCompare(eventEnd(a)));

  if (events.length === 0) {
    return <p className="text-ink/70">Aucun événement pour le moment.</p>;
  }

  return (
    <>
      {live.length > 0 && <Section title="En cours" events={live} now={now} />}
      {upcoming.length > 0 && <Section title="À venir" events={upcoming} now={now} />}
      {past.length > 0 && <Section title="Événements passés" events={past} now={now} />}
    </>
  );
}
