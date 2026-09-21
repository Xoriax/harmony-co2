"use client";

import Image from "next/image";
import { useState } from "react";
import {
  formatCountdown,
  formatShortDate,
  formatTime,
  type EventRow,
  type EventStatus,
} from "@/lib/event-format";

const STATUS: Record<EventStatus, { label: string; className: string }> = {
  live: { label: "En cours", className: "bg-emerald text-ink" },
  upcoming: { label: "À venir", className: "bg-night text-cream" },
  ended: { label: "Clos", className: "bg-cream text-ink/70" },
};

function DateRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="w-12 shrink-0 text-xs font-semibold uppercase tracking-[0.1em] text-forest">
        {label}
      </dt>
      <dd className="min-w-0 text-sm text-ink/85">
        {value ? (
          <>
            <span className="capitalize">{formatShortDate(value)}</span>
            <span className="font-bold text-night"> · {formatTime(value)}</span>
          </>
        ) : (
          <span className="text-ink/55">Non précisée</span>
        )}
      </dd>
    </div>
  );
}

export default function EventCard({
  event,
  status,
  remaining,
}: {
  event: EventRow;
  status: EventStatus;
  remaining: number;
}) {
  const [flipped, setFlipped] = useState(false);
  const badge = STATUS[status];
  const toggle = () => setFlipped((f) => !f);

  return (
    <li className={`h-[30rem] ${status === "ended" ? "opacity-80" : ""}`}>
      <div
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={`${event.title} : ${flipped ? "revenir à la carte" : "voir la description"}`}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        className={`flip-card h-full cursor-pointer rounded-3xl ${flipped ? "is-flipped" : ""}`}
      >
        <div className="flip-inner">
          {/* Face avant */}
          <div
            aria-hidden={flipped}
            className="flip-face flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-cream-soft shadow-[0_24px_40px_-30px_rgb(20_37_54/0.6)]"
          >
            <div className="relative h-48 shrink-0 bg-black">
              {event.cover_url ? (
                <Image
                  src={event.cover_url}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <span className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-[0_100%_0_100%] bg-leaf" />
              )}
              <span
                className={`absolute left-3 top-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold shadow ${badge.className}`}
              >
                {status === "live" && (
                  <span className="h-2 w-2 animate-pulse rounded-full bg-ink" />
                )}
                {badge.label}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-5">
              <h3 className="line-clamp-2 font-display text-xl font-bold leading-tight text-night">
                {event.title}
              </h3>
              <dl className="flex flex-col gap-1.5">
                <DateRow label="Début" value={event.starts_at} />
                <DateRow label="Fin" value={event.ends_at} />
              </dl>
              {status === "ended" ? (
                <p className="rounded-xl bg-ink/10 px-3 py-2 text-sm font-semibold text-ink/70">
                  Événement terminé
                </p>
              ) : (
                <div className="rounded-xl bg-night px-3 py-2 text-cream">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-leaf">
                    Se termine dans
                  </p>
                  <p
                    suppressHydrationWarning
                    className="font-display text-lg font-bold tabular-nums"
                  >
                    {formatCountdown(remaining)}
                  </p>
                </div>
              )}
              <p className="mt-auto text-xs font-semibold text-blue">
                Cliquer pour lire la description
              </p>
            </div>
          </div>

          {/* Face arrière */}
          <div
            aria-hidden={!flipped}
            className="flip-face flip-back flex flex-col gap-3 overflow-hidden rounded-3xl bg-forest p-6 text-cream"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-leaf">
              Description
            </span>
            <h3 className="line-clamp-2 font-display text-xl font-bold leading-tight">
              {event.title}
            </h3>
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <p className="whitespace-pre-line leading-relaxed text-cream/90">
                {event.description || "Aucune description pour cet événement."}
              </p>
            </div>
            <p className="text-xs font-semibold text-leaf">Cliquer pour revenir</p>
          </div>
        </div>
      </div>
    </li>
  );
}
