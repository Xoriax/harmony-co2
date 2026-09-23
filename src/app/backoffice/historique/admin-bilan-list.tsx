"use client";

import { useMemo, useState } from "react";
import { ANONYMOUS_USER_ID } from "@/lib/bilan-author";
import { matchesAdminBilanFilters } from "@/lib/bilan-filter";
import type { AdminBilanRow } from "@/lib/bilans";
import { parisYear } from "@/lib/paris-time";
import TiltCard from "../../tilt-card";

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
const fieldClass =
  "h-11 rounded-full border border-ink/20 bg-cream px-4 text-ink transition-colors focus:border-blue";

export default function AdminBilanList({ bilans }: { bilans: AdminBilanRow[] }) {
  const [association, setAssociation] = useState("");
  const [year, setYear] = useState("");

  const years = useMemo(
    () => [...new Set(bilans.map((b) => parisYear(new Date(b.created_at))))].sort((a, b) => b - a),
    [bilans],
  );

  const filtered = bilans.filter((b) =>
    matchesAdminBilanFilters(b, {
      association: association || null,
      year: year ? Number(year) : null,
    }),
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-56 flex-1 flex-col gap-1.5 text-sm font-medium">
          Association
          <input
            type="text"
            value={association}
            onChange={(e) => setAssociation(e.target.value)}
            placeholder="Rechercher par nom..."
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Année
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={`${fieldClass} bg-cream`}
          >
            <option value="">Toutes</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <p className="pb-3 text-sm text-ink/60">
          {filtered.length} bilan{filtered.length > 1 ? "s" : ""}
          {filtered.length !== bilans.length ? ` sur ${bilans.length}` : ""}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="text-ink/70">Aucun bilan ne correspond à ces filtres.</p>
      ) : (
        <ul className="flex flex-col gap-5">
          {filtered.map((b, index) => (
            <li
              key={b.id}
              className="rise"
              style={{ animationDelay: `${Math.min(index, 8) * 80}ms` }}
            >
              <TiltCard
                strength={0.35}
                className="grid gap-5 rounded-3xl border border-ink/10 bg-cream-soft p-6 md:grid-cols-[auto_1fr_auto] md:items-center"
              >
                <div className="flex flex-col">
                  <span className="font-display text-4xl font-extrabold tabular-nums text-night">
                    {nf.format(b.total)}
                  </span>
                  <span className="text-sm font-semibold text-forest">kgCO2e</span>
                </div>
                <div className="flex min-w-0 flex-col gap-3">
                  <div>
                    <p className="truncate font-display text-lg font-bold text-night">
                      {b.association_name || "Association non renseignée"}
                    </p>
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-ink/75">
                      <span className="capitalize">
                        {dateFormat.format(new Date(b.created_at))}
                      </span>
                      <span aria-hidden>·</span>
                      {b.user_id === ANONYMOUS_USER_ID ? (
                        <span className="rounded-full bg-ink/10 px-2.5 py-0.5 text-xs font-semibold text-ink/70">
                          Sans connexion
                        </span>
                      ) : (
                        <span>{b.user_name || "—"}</span>
                      )}
                    </p>
                  </div>
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
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`/backoffice/historique/fichier/${b.id}?format=pdf`}
                    className={linkClass}
                  >
                    PDF
                  </a>
                  <a
                    href={`/backoffice/historique/fichier/${b.id}?format=xlsx`}
                    className={linkClass}
                  >
                    Excel
                  </a>
                  <a
                    href={`/backoffice/historique/fichier/${b.id}?format=csv`}
                    className={linkClass}
                  >
                    CSV
                  </a>
                </div>
              </TiltCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
