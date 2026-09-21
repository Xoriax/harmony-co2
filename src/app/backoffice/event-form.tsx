"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { toInputValue, type EventRow } from "@/lib/event-format";
import { createEvent, updateEvent, type EventFormState } from "./actions";

const fieldClass =
  "min-w-0 rounded-xl border border-ink/20 bg-cream px-4 py-2.5 text-ink transition-colors focus:border-blue";

export default function EventForm({ event }: { event?: EventRow }) {
  const [state, action, pending] = useActionState<EventFormState, FormData>(
    event ? updateEvent.bind(null, event.id) : createEvent,
    null,
  );
  const v = state?.values;
  const [preview, setPreview] = useState<string | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const shownCover = preview ?? (removeCover ? null : (event?.cover_url ?? null));

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Titre
        <input
          name="title"
          required
          maxLength={120}
          defaultValue={v?.title ?? event?.title ?? ""}
          className={`${fieldClass} h-11`}
        />
      </label>
      <div className="flex flex-col gap-2 text-sm font-medium">
        <label htmlFor="cover">Image de couverture (facultative)</label>
        {shownCover && (
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-black">
            <Image
              src={shownCover}
              alt="Aperçu de la couverture"
              fill
              sizes="380px"
              unoptimized={preview !== null}
              className="object-cover"
            />
          </div>
        )}
        <input
          id="cover"
          type="file"
          name="cover"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setCoverError(null);
            if (file && file.size > 5 * 1024 * 1024) {
              e.target.value = "";
              setPreview(null);
              setCoverError("L'image ne doit pas dépasser 5 Mo.");
              return;
            }
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
          className="rounded-xl border border-ink/20 bg-cream text-sm file:mr-4 file:h-11 file:cursor-pointer file:border-0 file:bg-night file:px-4 file:font-semibold file:text-cream hover:file:bg-blue"
        />
        <span className="text-xs font-normal text-ink/65">
          JPG, PNG, WebP ou GIF, 5 Mo maximum. Format conseillé : 16/9.
        </span>
        {coverError && (
          <span role="alert" className="text-xs font-semibold text-red-800">
            {coverError}
          </span>
        )}
        {event?.cover_url && !preview && (
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-red-800">
            <input
              type="checkbox"
              name="remove_cover"
              checked={removeCover}
              onChange={(e) => setRemoveCover(e.target.checked)}
              className="h-4 w-4 accent-red-800"
            />
            Supprimer l&apos;image actuelle
          </label>
        )}
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Lieu
        <input
          name="location"
          maxLength={120}
          defaultValue={v?.location ?? event?.location ?? ""}
          className={`${fieldClass} h-11`}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Début
          <input
            type="datetime-local"
            name="starts_at"
            required
            defaultValue={v?.starts_at ?? toInputValue(event?.starts_at ?? null)}
            className={`${fieldClass} h-11`}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Fin
          <input
            type="datetime-local"
            name="ends_at"
            required
            defaultValue={v?.ends_at ?? toInputValue(event?.ends_at ?? null)}
            className={`${fieldClass} h-11`}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Description
        <textarea
          name="description"
          rows={5}
          maxLength={2000}
          defaultValue={v?.description ?? event?.description ?? ""}
          className={`${fieldClass} resize-y`}
        />
      </label>
      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-ink/15 bg-cream px-4 py-3 text-sm font-medium">
        <span className="flex flex-col">
          Visible sur la page Event
          <span className="text-xs font-normal text-ink/65">
            Décoche pour garder l&apos;événement en brouillon.
          </span>
        </span>
        <input
          type="checkbox"
          name="published"
          className="peer sr-only"
          defaultChecked={v ? v.published === "on" : (event?.published ?? true)}
        />
        <span className="relative h-7 w-12 shrink-0 rounded-full bg-ink/25 transition-colors after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-cream-soft after:shadow after:transition-transform peer-checked:bg-emerald peer-checked:after:translate-x-5 peer-focus-visible:ring-4 peer-focus-visible:ring-blue/40" />
      </label>

      {state?.error && (
        <p
          role="alert"
          className="rounded-xl border border-red-700/30 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
        >
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="h-12 rounded-full bg-forest px-7 font-semibold text-cream transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
        >
          {pending ? "Enregistrement..." : event ? "Enregistrer" : "Créer l'événement"}
        </button>
        {event && (
          <Link
            href="/backoffice"
            className="flex h-12 items-center rounded-full border-2 border-night/80 px-6 font-semibold text-night transition-colors hover:bg-night hover:text-cream"
          >
            Annuler
          </Link>
        )}
      </div>
    </form>
  );
}
