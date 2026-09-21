"use client";

import { deleteEvent } from "./actions";

export default function DeleteEventButton({ id, title }: { id: string; title: string }) {
  return (
    <form action={deleteEvent}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm(`Supprimer « ${title} » ? Cette action est définitive.`)) e.preventDefault();
        }}
        className="h-10 rounded-full border-2 border-red-800/60 px-4 text-sm font-semibold text-red-800 transition-colors hover:bg-red-800 hover:text-cream"
      >
        Supprimer
      </button>
    </form>
  );
}
