"use client";

import { deleteBilan } from "./actions";

export default function DeleteBilanButton({ id }: { id: string }) {
  return (
    <form action={deleteBilan}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm("Supprimer ce bilan et ses fichiers ? Cette action est définitive.")) {
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
