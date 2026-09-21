"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { TEAMS, type MemberRow } from "@/lib/mandat-format";
import { Switch } from "../switch";
import { createMember, updateMember, type MemberFormState } from "./actions";

const fieldClass =
  "h-11 min-w-0 rounded-xl border border-ink/20 bg-cream px-4 text-ink transition-colors focus:border-blue";

export default function MemberForm({ member }: { member?: MemberRow }) {
  const [state, action, pending] = useActionState<MemberFormState, FormData>(
    member ? updateMember.bind(null, member.id) : createMember,
    null,
  );
  const v = state?.values;
  const on = (key: "show_photo" | "show_email" | "show_discord") =>
    v ? v[key] === "on" : (member?.[key] ?? true);

  const [preview, setPreview] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const shownPhoto = preview ?? (removePhoto ? null : (member?.photo_url ?? null));

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Nom
        <input
          name="name"
          required
          maxLength={80}
          defaultValue={v?.name ?? member?.name ?? ""}
          className={fieldClass}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Poste occupé
        <input
          name="role"
          required
          maxLength={80}
          defaultValue={v?.role ?? member?.role ?? ""}
          className={fieldClass}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-[1fr_7rem] lg:grid-cols-1 xl:grid-cols-[1fr_7rem]">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Groupe
          <select
            name="team"
            defaultValue={v?.team ?? member?.team ?? TEAMS[0].value}
            className={fieldClass}
          >
            {TEAMS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Ordre
          <input
            type="number"
            name="position"
            min={0}
            max={9999}
            step={1}
            placeholder="auto"
            defaultValue={v?.position ?? (member ? String(member.position) : "")}
            className={fieldClass}
          />
        </label>
      </div>

      <div className="flex flex-col gap-2 text-sm font-medium">
        <label htmlFor="photo">Photo</label>
        {shownPhoto && (
          <div className="relative aspect-[4/5] w-40 overflow-hidden rounded-xl bg-black">
            <Image
              src={shownPhoto}
              alt="Aperçu de la photo"
              fill
              sizes="160px"
              unoptimized={preview !== null}
              className="object-cover"
            />
          </div>
        )}
        <input
          id="photo"
          type="file"
          name="photo"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setPhotoError(null);
            if (file && file.size > 5 * 1024 * 1024) {
              e.target.value = "";
              setPreview(null);
              setPhotoError("L'image ne doit pas dépasser 5 Mo.");
              return;
            }
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
          className="rounded-xl border border-ink/20 bg-cream text-sm file:mr-4 file:h-11 file:cursor-pointer file:border-0 file:bg-night file:px-4 file:font-semibold file:text-cream hover:file:bg-blue"
        />
        <span className="text-xs font-normal text-ink/65">
          JPG, PNG, WebP ou GIF, 5 Mo maximum. Format conseillé : portrait 4/5.
        </span>
        {photoError && (
          <span role="alert" className="text-xs font-semibold text-red-800">
            {photoError}
          </span>
        )}
        {member?.photo_url && !preview && (
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-red-800">
            <input
              type="checkbox"
              name="remove_photo"
              checked={removePhoto}
              onChange={(e) => setRemovePhoto(e.target.checked)}
              className="h-4 w-4 accent-red-800"
            />
            Supprimer la photo actuelle
          </label>
        )}
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        E-mail
        <input
          type="email"
          name="email"
          maxLength={120}
          defaultValue={v?.email ?? member?.email ?? ""}
          className={fieldClass}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Discord
        <input
          name="discord"
          maxLength={60}
          placeholder="pseudo"
          defaultValue={v?.discord ?? member?.discord ?? ""}
          className={fieldClass}
        />
      </label>

      <fieldset className="flex flex-col gap-3 rounded-xl border border-ink/15 bg-cream px-4 py-4">
        <legend className="px-2 text-sm font-semibold text-night">
          Éléments affichés sur la carte
        </legend>
        <Switch name="show_photo" label="Photo" defaultChecked={on("show_photo")} />
        <Switch name="show_email" label="E-mail" defaultChecked={on("show_email")} />
        <Switch name="show_discord" label="Discord" defaultChecked={on("show_discord")} />
        <p className="text-xs text-ink/65">
          Un élément masqué n&apos;est jamais envoyé au navigateur des visiteurs.
        </p>
      </fieldset>

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
          {pending ? "Enregistrement..." : member ? "Enregistrer" : "Ajouter le membre"}
        </button>
        {member && (
          <Link
            href="/backoffice/mandat"
            className="flex h-12 items-center rounded-full border-2 border-night/80 px-6 font-semibold text-night transition-colors hover:bg-night hover:text-cream"
          >
            Annuler
          </Link>
        )}
      </div>
    </form>
  );
}
