"use client";

import { useMemo, useState } from "react";
import { matchesBilanFilters } from "@/lib/bilan-filter";
import type { BilanRow } from "@/lib/bilans";
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
const fieldClass =
  "h-11 rounded-full border border-ink/20 bg-cream px-4 text-ink transition-colors focus:border-blue";

export default function HistoriqueList({ bilans }: { bilans: BilanRow[] }) {
  const [category, setCategory] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const categories = useMemo(
    () => [...new Set(bilans.flatMap((b) => b.categories.map((c) => c.name)))].sort(),
    [bilans],
  );

  const filtered = bilans.filter((b) =>
    matchesBilanFilters(b, { category: category || null, from: from || null, to: to || null }),
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Depuis le
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Jusqu&apos;au
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Catégorie
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${fieldClass} bg-cream`}
          >
            <option value="">Toutes</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
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
                <div className="depth-1 flex flex-col">
                  <span className="font-display text-4xl font-extrabold tabular-nums text-night">
                    {nf.format(b.total)}
                  </span>
                  <span className="text-sm font-semibold text-forest">kgCO2e</span>
                </div>
                <div className="depth-2 flex min-w-0 flex-col gap-3">
                  <div>
                    {b.association_name && (
                      <p className="truncate font-display text-lg font-bold text-night">
                        {b.association_name}
                      </p>
                    )}
                    <p className="text-sm font-medium capitalize text-ink/75">
                      {dateFormat.format(new Date(b.created_at))}
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
                <div className="depth-2 flex flex-wrap gap-3">
                  {/* Liens classiques : la route redirige vers une URL de téléchargement signée
                      (pdf, xlsx) ou renvoie directement le fichier (csv, généré à la volée). */}
                  <a href={`/historique/fichier/${b.id}?format=pdf`} className={linkClass}>
                    PDF
                  </a>
                  <a href={`/historique/fichier/${b.id}?format=xlsx`} className={linkClass}>
                    Excel
                  </a>
                  <a href={`/historique/fichier/${b.id}?format=csv`} className={linkClass}>
                    CSV
                  </a>
                  <DeleteBilanButton id={b.id} />
                </div>
              </TiltCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
