"use client";

import { useActionState } from "react";
import type { Settings } from "@/lib/settings";
import { updateSettings, type SettingsFormState } from "./actions";

const fieldClass =
  "min-w-0 rounded-xl border border-ink/20 bg-cream px-4 py-2.5 text-ink transition-colors focus:border-blue";

export default function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action, pending] = useActionState<SettingsFormState, FormData>(
    updateSettings,
    null,
  );
  const v = state?.values;

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium">
          Objectif (kgCO2e)
          <input
            name="goalTotal"
            inputMode="decimal"
            placeholder="Vide = pas de comparaison"
            defaultValue={v?.goalTotal ?? settings.goalTotal ?? ""}
            className={`${fieldClass} h-11`}
          />
        </label>
        <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium">
          Libellé de l&apos;objectif
          <input
            name="goalLabel"
            maxLength={60}
            placeholder="Objectif 2026"
            defaultValue={v?.goalLabel ?? settings.goalLabel ?? ""}
            className={`${fieldClass} h-11`}
          />
        </label>
      </div>
      <p className="text-sm text-ink/65">
        Affiché sur la page Bilan : l&apos;écart entre le total calculé et cet objectif.
      </p>

      <label className="flex max-w-xs flex-col gap-1.5 text-sm font-medium">
        Seuil d&apos;alerte Discord (kgCO2e)
        <input
          name="alertThreshold"
          inputMode="decimal"
          placeholder="Vide = aucune alerte"
          defaultValue={v?.alertThreshold ?? settings.alertThreshold ?? ""}
          className={`${fieldClass} h-11`}
        />
      </label>
      <p className="text-sm text-ink/65">
        Un bilan dont le total dépasse ce seuil déclenche une alerte dans le salon Discord réservé
        aux administrateurs (webhook{" "}
        <code className="rounded bg-cream-soft px-1.5">DISCORD_BILAN_ALERT_WEBHOOK_URL</code>).
      </p>

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}
      {state?.saved && !state.error && (
        <p role="status" className="text-sm font-medium text-forest">
          Réglages enregistrés.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-11 w-fit rounded-full bg-forest px-6 font-semibold text-cream transition-transform hover:-translate-y-0.5 disabled:opacity-50"
      >
        {pending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
