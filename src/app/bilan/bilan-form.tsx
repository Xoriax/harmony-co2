"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { GlobeScene } from "../globe-scene";
import { computeBilan } from "./actions";
import type { BilanCategory, BilanInput, BilanResult } from "./types";

type Line = { itemId: string; quantity: string; trips: string };
type CategoryState = { included: boolean; lines: Line[] };

const emptyLine = (): Line => ({ itemId: "", quantity: "", trips: "1" });

const quantityLabels: Record<string, string> = {
  numerique: "Quantité",
  alimentation: "Nombre de repas",
  boisson: "Quantité en litres",
  habillement: "Quantité",
  "usage-numerique": "Quantité (emails, Go ou heures)",
  mobilier: "Quantité",
  transport: "Distance par trajet (km)",
};

const TONES = ["bg-leaf", "bg-sky", "bg-gold", "bg-emerald", "bg-blue", "bg-night", "bg-forest"];

const inputClass =
  "h-11 min-w-0 rounded-xl border border-ink/20 bg-cream px-4 text-ink transition-colors focus:border-blue disabled:opacity-50";
const buttonClass =
  "h-10 rounded-full border-2 border-night/80 px-4 text-sm font-semibold text-night transition-colors hover:bg-night hover:text-cream disabled:opacity-50";

const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
const pctFormat = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 1,
  signDisplay: "always",
});

// Un écart négatif ou nul (moins d'émissions) est en vert ; un écart positif est en doré.
function ComparisonCard({
  label,
  reference,
  deltaPct,
}: {
  label: string;
  reference: number;
  deltaPct: number | null;
}) {
  const better = deltaPct !== null && deltaPct <= 0;
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl bg-cream p-5">
      <span className="text-sm font-semibold text-ink/70">{label}</span>
      <span className="font-display text-3xl font-extrabold tabular-nums text-night">
        {nf.format(reference)}
        <span className="ml-1 text-base font-semibold text-ink/60">kgCO2e</span>
      </span>
      {deltaPct !== null && (
        <span
          className={`w-fit rounded-full px-3 py-1 text-sm font-bold tabular-nums ${
            better ? "bg-emerald/20 text-forest" : "bg-gold/25 text-ink"
          }`}
        >
          {pctFormat.format(deltaPct)} %
        </span>
      )}
    </div>
  );
}

export default function BilanForm({ categories }: { categories: BilanCategory[] }) {
  const [state, setState] = useState<Record<string, CategoryState>>(() =>
    Object.fromEntries(categories.map((c) => [c.slug, { included: false, lines: [emptyLine()] }])),
  );
  const [result, setResult] = useState<BilanResult | null>(null);
  const [pending, startTransition] = useTransition();
  const resultRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<"pdf" | "xlsx" | "csv" | null>(null);
  const [exportError, setExportError] = useState(false);

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  const includedCategories = categories.filter((c) => state[c.slug].included);

  function update(categoryId: string, change: (current: CategoryState) => CategoryState) {
    setState((prev) => ({ ...prev, [categoryId]: change(prev[categoryId]) }));
  }

  function updateLine(categoryId: string, index: number, patch: Partial<Line>) {
    update(categoryId, (c) => ({
      ...c,
      lines: c.lines.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    }));
  }

  // Le module d'export (et ses librairies PDF/Excel) n'est chargé qu'à l'usage ou à l'approche du
  // bouton ; le CSV ne dépend d'aucune librairie lourde, pas besoin de le précharger.
  function preloadExport(kind: "pdf" | "xlsx") {
    import("./export")
      .then(async (m) => {
        await (kind === "pdf" ? m.preloadPdf() : m.preloadExcel());
      })
      .catch(() => {});
  }

  async function runExport(kind: "pdf" | "xlsx" | "csv") {
    if (!result || !("total" in result)) return;
    setExporting(kind);
    setExportError(false);
    try {
      const { exportCsv, exportExcel, exportPdf } = await import("./export");
      if (kind === "pdf") await exportPdf(result);
      else if (kind === "xlsx") await exportExcel(result);
      else exportCsv(result);
    } catch {
      setExportError(true);
    } finally {
      setExporting(null);
    }
  }

  function submit() {
    const input: BilanInput = categories
      .filter((c) => state[c.slug].included)
      .map((c) => ({
        categorySlug: c.slug,
        lines: state[c.slug].lines
          .filter((l) => l.itemId && Number(l.quantity) > 0)
          .map((l) => ({
            ref: l.itemId,
            quantity: Number(l.quantity),
            trips: c.slug === "transport" ? Number(l.trips) || 1 : undefined,
          })),
      }))
      .filter((c) => c.lines.length > 0);

    startTransition(async () => setResult(await computeBilan(input)));
  }

  return (
    <div className="flex flex-col gap-12">
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-5">
          {categories.map((category, ci) => {
            const { included, lines } = state[category.slug];
            const isTransport = category.slug === "transport";

            return (
              <section
                key={category.slug}
                className={`rounded-3xl border-2 p-5 transition-all duration-300 ${
                  included
                    ? "border-forest bg-cream-soft shadow-[0_24px_40px_-28px_rgb(7_80_74/0.6)]"
                    : "border-ink/10 bg-cream-soft/60 hover:border-ink/25"
                }`}
              >
                <label className="flex cursor-pointer items-center justify-between gap-4">
                  <span className="flex items-center gap-3">
                    <span
                      className={`flip h-10 w-10 shrink-0 rounded-[0_100%_0_100%] border-2 border-ink ${included ? "on" : ""} ${TONES[ci % TONES.length]}`}
                    />
                    <span className="font-display text-xl font-bold text-night">
                      {category.name}
                    </span>
                  </span>
                  <span className="flex items-center gap-3 text-sm font-semibold text-ink/75">
                    {included ? "Inclus" : "Inclure"}
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={included}
                      onChange={(e) =>
                        update(category.slug, (c) => ({ ...c, included: e.target.checked }))
                      }
                    />
                    <span className="relative h-7 w-12 rounded-full bg-ink/25 transition-colors after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-cream-soft after:shadow after:transition-transform peer-checked:bg-emerald peer-checked:after:translate-x-5 peer-focus-visible:ring-4 peer-focus-visible:ring-blue/40" />
                  </span>
                </label>

                {included && (
                  <div className="unfold mt-5 flex flex-col gap-4 border-t border-ink/10 pt-5">
                    {lines.map((line, index) => (
                      <div key={index} className="flex flex-wrap items-end gap-3">
                        <label className="flex min-w-48 flex-[2] flex-col gap-1.5 text-sm font-medium">
                          {isTransport ? "Transport" : "Élément"}
                          <select
                            value={line.itemId}
                            onChange={(e) =>
                              updateLine(category.slug, index, { itemId: e.target.value })
                            }
                            className={inputClass}
                          >
                            <option value="">Choisir un élément</option>
                            {category.items.map((item) => (
                              <option key={item.ref} value={item.ref}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="flex min-w-32 flex-1 flex-col gap-1.5 text-sm font-medium">
                          {quantityLabels[category.slug] ?? "Quantité"}
                          <input
                            type="number"
                            min="0"
                            step="any"
                            inputMode="decimal"
                            value={line.quantity}
                            onChange={(e) =>
                              updateLine(category.slug, index, { quantity: e.target.value })
                            }
                            className={inputClass}
                          />
                        </label>
                        {isTransport && (
                          <label className="flex w-28 flex-col gap-1.5 text-sm font-medium">
                            Trajets
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={line.trips}
                              onChange={(e) =>
                                updateLine(category.slug, index, { trips: e.target.value })
                              }
                              className={inputClass}
                            />
                          </label>
                        )}
                        <button
                          type="button"
                          className={buttonClass}
                          onClick={() =>
                            update(category.slug, (c) => ({
                              ...c,
                              lines:
                                c.lines.length > 1
                                  ? c.lines.filter((_, i) => i !== index)
                                  : [emptyLine()],
                            }))
                          }
                        >
                          Supprimer
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className={`${buttonClass} self-start`}
                      onClick={() =>
                        update(category.slug, (c) => ({ ...c, lines: [...c.lines, emptyLine()] }))
                      }
                    >
                      + {isTransport ? "Ajouter un transport" : "Ajouter un élément"}
                    </button>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <aside className="flex flex-col gap-5 rounded-3xl bg-forest p-6 text-cream lg:sticky lg:top-24">
          <div className="mx-auto -mb-4 w-36">
            <GlobeScene small />
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-leaf">
            Ton bilan
          </span>
          <p className="font-display text-5xl font-extrabold tabular-nums">
            {includedCategories.length}
            <span className="ml-2 text-xl font-bold text-cream/70">/ {categories.length}</span>
          </p>
          <p className="-mt-3 text-sm text-cream/80">
            {includedCategories.length > 1 ? "catégories incluses" : "catégorie incluse"}
          </p>
          {includedCategories.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {includedCategories.map((c) => (
                <li
                  key={c.slug}
                  className="rounded-full bg-cream/15 px-3 py-1 text-xs font-semibold"
                >
                  {c.name}
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={submit}
            disabled={pending || includedCategories.length === 0}
            className="h-12 rounded-full bg-gold px-6 font-semibold text-ink transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
          >
            {pending ? "Calcul..." : "Calculer le bilan"}
          </button>
          {includedCategories.length === 0 && (
            <p className="text-sm text-cream/75">
              Active au moins une catégorie pour lancer le calcul.
            </p>
          )}
        </aside>
      </div>

      {result && "error" in result && (
        <p
          role="alert"
          className="rounded-2xl border-2 border-red-700/30 bg-red-50 px-5 py-4 font-medium text-red-800"
        >
          {result.error}
        </p>
      )}

      {result && "total" in result && (
        <div ref={resultRef} className="flex scroll-mt-24 flex-col gap-6">
          <section className="relative grid items-center gap-6 overflow-hidden rounded-[2rem] bg-night p-7 text-cream md:grid-cols-[1fr_auto] md:p-10">
            <span className="absolute -bottom-28 -left-20 h-64 w-64 rounded-full border-[24px] border-blue/50" />
            <div className="relative flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-leaf">
                Résultats
              </span>
              <p className="flex flex-wrap items-baseline gap-3">
                <span className="font-display text-6xl font-extrabold tabular-nums sm:text-7xl">
                  {nf.format(result.total)}
                </span>
                <span className="text-xl font-semibold text-cream/80">kgCO2e</span>
              </p>
              <p className="max-w-[46ch] text-cream/80">
                Total des catégories incluses, avec le détail par catégorie ci-dessous.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => runExport("pdf")}
                  onPointerEnter={() => preloadExport("pdf")}
                  onFocus={() => preloadExport("pdf")}
                  disabled={exporting !== null}
                  className="h-11 rounded-full bg-gold px-6 font-semibold text-ink transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
                >
                  {exporting === "pdf" ? "Export..." : "Exporter en PDF"}
                </button>
                <button
                  type="button"
                  onClick={() => runExport("xlsx")}
                  onPointerEnter={() => preloadExport("xlsx")}
                  onFocus={() => preloadExport("xlsx")}
                  disabled={exporting !== null}
                  className="h-11 rounded-full border-2 border-cream/60 px-6 font-semibold transition-colors hover:bg-cream hover:text-night disabled:opacity-60"
                >
                  {exporting === "xlsx" ? "Export..." : "Exporter en Excel"}
                </button>
                <button
                  type="button"
                  onClick={() => runExport("csv")}
                  disabled={exporting !== null}
                  className="h-11 rounded-full border-2 border-cream/60 px-6 font-semibold transition-colors hover:bg-cream hover:text-night disabled:opacity-60"
                >
                  {exporting === "csv" ? "Export..." : "Exporter en CSV"}
                </button>
              </div>
              {result.history === "saved" && (
                <p className="text-sm font-medium text-leaf">
                  Bilan enregistré dans ton{" "}
                  <a href="/historique" className="underline underline-offset-2">
                    historique
                  </a>{" "}
                  (PDF et Excel).
                </p>
              )}
              {result.history === "failed" && (
                <p role="alert" className="text-sm font-medium text-gold">
                  Le bilan n&apos;a pas pu être enregistré dans ton historique.
                </p>
              )}
              {exportError && (
                <p role="alert" className="text-sm font-medium text-gold">
                  L&apos;export a échoué, réessaie.
                </p>
              )}
            </div>
            <div className="w-44 justify-self-center">
              <GlobeScene small />
            </div>
          </section>

          {result.comparison &&
            (result.comparison.previousAverage !== null ||
              result.comparison.goalTotal !== null) && (
              <section className="grid gap-4 sm:grid-cols-2">
                {result.comparison.previousAverage !== null && (
                  <ComparisonCard
                    label="Vs. ta moyenne précédente"
                    reference={result.comparison.previousAverage}
                    deltaPct={result.comparison.previousDeltaPct}
                  />
                )}
                {result.comparison.goalTotal !== null && (
                  <ComparisonCard
                    label={result.comparison.goalLabel ?? "Vs. l'objectif"}
                    reference={result.comparison.goalTotal}
                    deltaPct={result.comparison.goalDeltaPct}
                  />
                )}
              </section>
            )}

          <section className="flex flex-col gap-5 rounded-3xl border border-ink/10 bg-cream-soft p-6">
            <h2 className="font-display text-2xl font-bold text-night">Répartition</h2>
            <ul className="flex flex-col gap-4">
              {result.categories.map((category, i) => {
                const pct = result.total > 0 ? (category.subtotal / result.total) * 100 : 0;
                return (
                  <li key={category.name} className="flex flex-col gap-1.5">
                    <div className="flex justify-between gap-4 text-sm font-semibold">
                      <span>{category.name}</span>
                      <span className="tabular-nums">
                        {nf.format(category.subtotal)} kgCO2e · {nf.format(pct)} %
                      </span>
                    </div>
                    <div className="h-3.5 overflow-hidden rounded-full bg-ink/10">
                      <div
                        className={`bar-grow h-full rounded-full ${TONES[i % TONES.length]}`}
                        style={{ width: `${Math.max(pct, 1.5)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="grid gap-6">
            {result.categories.map((category) => (
              <section
                key={category.name}
                className="flex flex-col gap-3 rounded-3xl border border-ink/10 bg-cream-soft p-6"
              >
                <h3 className="flex flex-wrap justify-between gap-2 font-display text-xl font-bold text-night">
                  <span>{category.name}</span>
                  <span className="tabular-nums text-forest">
                    {nf.format(category.subtotal)} kgCO2e
                  </span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm tabular-nums">
                    <thead>
                      <tr className="border-b-2 border-ink/15 text-xs uppercase tracking-[0.08em] text-ink/70">
                        <th className="py-2 pr-4 font-semibold">Élément</th>
                        <th className="py-2 pr-4 font-semibold">Quantité</th>
                        <th className="py-2 pr-4 font-semibold">Facteur (kgCO2e/unité)</th>
                        <th className="py-2 font-semibold">Émissions (kgCO2e)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.lines.map((line, i) => (
                        <tr key={i} className="border-b border-ink/10 last:border-0">
                          <td className="py-2.5 pr-4 font-medium">{line.name}</td>
                          <td className="py-2.5 pr-4">
                            {nf.format(line.quantity)} {line.unit}
                          </td>
                          <td className="py-2.5 pr-4">
                            {new Intl.NumberFormat("fr-FR", {
                              maximumSignificantDigits: 3,
                            }).format(line.factor)}
                          </td>
                          <td className="py-2.5 font-semibold">{nf.format(line.emissions)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
