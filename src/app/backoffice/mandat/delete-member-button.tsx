"use client";

import { deleteMember } from "./actions";

export default function DeleteMemberButton({ id, name }: { id: string; name: string }) {
  return (
    <form action={deleteMember}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm(`Supprimer « ${name} » de la page Mandat ? Cette action est définitive.`)) {
            e.preventDefault();
          }
        }}
        className="h-10 rounded-full border-2 border-red-800/60 px-4 text-sm font-semibold text-red-800 transition-colors hover:bg-red-800 hover:text-cream"
      >
        Supprimer
      </button>
    </form>
  );
}
