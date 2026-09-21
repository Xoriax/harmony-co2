import "server-only";

const BASE = "https://impactco2.fr/api/v1";

export type CatalogItem = { ref: string; name: string; factor: number };

type CategoryDef = {
  slug: string;
  name: string;
  // Thématique Impact CO2 ; absent pour le transport (endpoint dédié).
  thematique?: number;
  keep?: (ref: string) => boolean;
};

export const CATEGORIES: CategoryDef[] = [
  { slug: "numerique", name: "Numérique", thematique: 1 },
  {
    slug: "alimentation",
    name: "Alimentation (repas)",
    thematique: 2,
    // L'API liste aussi les aliments seuls ; on ne garde que les types de repas.
    keep: (ref) => ref.startsWith("repas"),
  },
  { slug: "boisson", name: "Boisson", thematique: 3 },
  { slug: "habillement", name: "Habillement", thematique: 5 },
  { slug: "usage-numerique", name: "Usage numérique", thematique: 10 },
  { slug: "mobilier", name: "Mobilier", thematique: 7 },
  { slug: "transport", name: "Transport" },
];

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${process.env.IMPACTCO2_TOKEN}` },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Impact CO2 ${path} : HTTP ${res.status}`);
  return ((await res.json()) as { data: T }).data;
}

// Éléments d'une catégorie avec leur facteur d'émission :
// kgCO2e par unité, ou par km et par personne pour le transport.
export async function getCategoryItems(def: CategoryDef): Promise<CatalogItem[]> {
  if (!def.thematique) {
    const modes = await get<{ id: number; name: string; value: number }[]>(
      "/transport?km=1&displayAll=1&language=fr",
    );
    return modes.map((m) => ({ ref: String(m.id), name: m.name.trim(), factor: m.value }));
  }

  const items = await get<{ slug: string; name: string; ecv: number }[]>(
    `/thematiques/ecv/${def.thematique}?language=fr`,
  );
  return items
    .filter((i) => !def.keep || def.keep(i.slug))
    .map((i) => ({ ref: i.slug, name: i.name.trim(), factor: i.ecv }));
}
