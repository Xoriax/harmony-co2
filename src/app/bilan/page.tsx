import { CATEGORIES, getCategoryItems } from "@/lib/impactco2";
import { GlobeScene } from "../globe-scene";
import { LeafPage } from "../leaf-page";
import { SiteHeader } from "../site-header";
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
    <>
      <SiteHeader />

      <LeafPage>
        <section className="grain overflow-hidden border-b border-ink/10">
          <div className="mx-auto grid max-w-6xl items-center gap-6 px-5 py-10 md:grid-cols-[1fr_auto] md:py-14">
            <div className="flex flex-col gap-5">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-forest/25 bg-cream-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-forest">
                <span className="h-2 w-2 rounded-full bg-emerald" />
                Bilan carbone
              </span>
              <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-night [text-wrap:balance] sm:text-5xl lg:text-6xl">
                Mesure l&apos;empreinte de ton <span className="text-forest">association</span>
              </h1>
              <p className="max-w-[56ch] text-lg leading-relaxed text-ink/80">
                Choisis les postes qui te concernent, renseigne les quantités et obtiens un total en
                kgCO2e avec le détail par catégorie. Les facteurs d&apos;émission viennent
                d&apos;Impact CO2 (ADEME).
              </p>
            </div>
            <div className="hidden w-60 md:block">
              <GlobeScene small />
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-6xl px-5 py-10 md:py-14">
          {categories ? (
            <BilanForm categories={categories} />
          ) : (
            <p
              role="alert"
              className="rounded-2xl border-2 border-red-700/30 bg-red-50 px-5 py-4 font-medium text-red-800"
            >
              Impossible de charger les données Impact CO2, réessaie plus tard.
            </p>
          )}
        </div>
      </LeafPage>
    </>
  );
}
