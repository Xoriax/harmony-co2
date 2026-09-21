"use client";

import { useState, useTransition } from "react";
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

const inputClass =
  "h-10 min-w-0 rounded-full border border-black/[.15] bg-transparent px-4 dark:border-white/[.25]";
const buttonClass =
  "h-10 rounded-full border border-black/[.15] px-4 text-sm transition-colors hover:bg-black/[.05] disabled:opacity-50 dark:border-white/[.25] dark:hover:bg-white/[.1]";

const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

export default function BilanForm({ categories }: { categories: BilanCategory[] }) {
  const [state, setState] = useState<Record<string, CategoryState>>(() =>
    Object.fromEntries(categories.map((c) => [c.slug, { included: false, lines: [emptyLine()] }])),
  );
  const [result, setResult] = useState<BilanResult | null>(null);
  const [pending, startTransition] = useTransition();

  function update(categoryId: string, change: (current: CategoryState) => CategoryState) {
    setState((prev) => ({ ...prev, [categoryId]: change(prev[categoryId]) }));
  }

  function updateLine(categoryId: string, index: number, patch: Partial<Line>) {
    update(categoryId, (c) => ({
      ...c,
      lines: c.lines.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    }));
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
    <div className="flex flex-col gap-6">
      {categories.map((category) => {
        const { included, lines } = state[category.slug];
        const isTransport = category.slug === "transport";

        return (
          <section
            key={category.slug}
            className="rounded-2xl border border-black/[.1] p-4 dark:border-white/[.2]"
          >
            <label className="flex cursor-pointer items-center justify-between gap-4">
              <span className="text-lg font-medium">{category.name}</span>
              <span className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={included}
                  onChange={(e) => update(category.slug, (c) => ({ ...c, included: e.target.checked }))}
                />
                Inclure
              </span>
            </label>

            {included && (
              <div className="mt-4 flex flex-col gap-3">
                {lines.map((line, index) => (
                  <div key={index} className="flex flex-wrap items-end gap-2">
                    <label className="flex min-w-48 flex-[2] flex-col gap-1 text-sm">
                      {isTransport ? "Transport" : "Élément"}
                      <select
                        value={line.itemId}
                        onChange={(e) => updateLine(category.slug, index, { itemId: e.target.value })}
                        className={`${inputClass} bg-background`}
                      >
                        <option value="">Choisir un élément</option>
                        {category.items.map((item) => (
                          <option key={item.ref} value={item.ref}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex min-w-32 flex-1 flex-col gap-1 text-sm">
                      {quantityLabels[category.slug] ?? "Quantité"}
                      <input
                        type="number"
                        min="0"
                        step="any"
                        inputMode="decimal"
                        value={line.quantity}
                        onChange={(e) => updateLine(category.slug, index, { quantity: e.target.value })}
                        className={inputClass}
                      />
                    </label>
                    {isTransport && (
                      <label className="flex w-28 flex-col gap-1 text-sm">
                        Trajets
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={line.trips}
                          onChange={(e) => updateLine(category.slug, index, { trips: e.target.value })}
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
                          lines: c.lines.length > 1 ? c.lines.filter((_, i) => i !== index) : [emptyLine()],
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
                  onClick={() => update(category.slug, (c) => ({ ...c, lines: [...c.lines, emptyLine()] }))}
                >
                  {isTransport ? "Ajouter un transport" : "Ajouter un élément"}
                </button>
              </div>
            )}
          </section>
        );
      })}

      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="h-12 self-start rounded-full bg-foreground px-6 font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {pending ? "Calcul..." : "Calculer le bilan"}
      </button>

      {result && "error" in result && (
        <p role="alert" className="text-red-600">
          {result.error}
        </p>
      )}

      {result && "total" in result && (
        <section className="flex flex-col gap-6 rounded-2xl border border-black/[.1] p-6 dark:border-white/[.2]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Résultats</h2>
              <p className="text-sm opacity-70">Total en kgCO2e avec détail par catégorie.</p>
            </div>
            <p className="text-right">
              <span className="block text-sm opacity-70">Total</span>
              <span className="text-3xl font-semibold">{nf.format(result.total)}</span>
              <span className="block text-sm">kgCO2e</span>
            </p>
          </div>

          {result.categories.map((category) => (
            <div key={category.name} className="flex flex-col gap-2">
              <h3 className="flex justify-between font-medium">
                <span>{category.name}</span>
                <span>{nf.format(category.subtotal)} kgCO2e</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-black/[.1] dark:border-white/[.2]">
                      <th className="py-2 pr-4 font-medium">Élément</th>
                      <th className="py-2 pr-4 font-medium">Quantité</th>
                      <th className="py-2 pr-4 font-medium">Facteur (kgCO2e/unité)</th>
                      <th className="py-2 font-medium">Émissions (kgCO2e)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.lines.map((line, i) => (
                      <tr key={i} className="border-b border-black/[.06] dark:border-white/[.1]">
                        <td className="py-2 pr-4">{line.name}</td>
                        <td className="py-2 pr-4">
                          {nf.format(line.quantity)} {line.unit}
                        </td>
                        <td className="py-2 pr-4">
                          {new Intl.NumberFormat("fr-FR", { maximumSignificantDigits: 3 }).format(line.factor)}
                        </td>
                        <td className="py-2">{nf.format(line.emissions)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
