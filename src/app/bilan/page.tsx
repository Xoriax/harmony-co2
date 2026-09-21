import Link from "next/link";
import { CATEGORIES, getCategoryItems } from "@/lib/impactco2";
import BilanForm from "./bilan-form";
import type { BilanCategory } from "./types";

async function loadCategories(): Promise<BilanCategory[] | null> {
  try {
    return await Promise.all(
      CATEGORIES.map(async (def) => ({
        slug: def.slug,
        name: def.name,
        items: (await getCategoryItems(def)).map(({ ref, name }) => ({ ref, name })),
      })),
    );
  } catch {
    return null;
  }
}

export default async function BilanPage() {
  const categories = await loadCategories();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Bilan carbo</h1>
        <Link
          href="/"
          className="flex h-10 items-center rounded-full border border-black/[.15] px-4 text-sm transition-colors hover:bg-black/[.05] dark:border-white/[.25] dark:hover:bg-white/[.1]"
        >
          Accueil
        </Link>
      </div>

      {categories ? (
        <BilanForm categories={categories} />
      ) : (
        <p role="alert" className="text-red-600">
          Impossible de charger les données Impact CO2, réessaie plus tard.
        </p>
      )}
    </main>
  );
}
