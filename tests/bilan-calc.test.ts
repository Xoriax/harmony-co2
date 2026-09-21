import { describe, expect, it, vi } from "vitest";
import { buildBilan, type BilanDeps, type CatalogItem } from "@/lib/bilan-calc";
import type { BilanInput } from "@/app/bilan/types";

const CATALOG: Record<string, CatalogItem[]> = {
  numerique: [
    { ref: "laptop", name: "Ordinateur portable", factor: 156 },
    { ref: "phone", name: "Smartphone", factor: 50 },
  ],
  alimentation: [{ ref: "repas-vegetarien", name: "Repas végétarien", factor: 0.5 }],
  boisson: [{ ref: "cafe", name: "Café", factor: 0.25 }],
  transport: [
    { ref: "1", name: "Voiture thermique", factor: 0.2 },
    { ref: "2", name: "Train", factor: 0.02 },
  ],
};

const deps = (overrides: Partial<BilanDeps> = {}): BilanDeps => ({
  categories: [
    { slug: "numerique", name: "Numérique" },
    { slug: "alimentation", name: "Alimentation (repas)" },
    { slug: "boisson", name: "Boisson" },
    { slug: "transport", name: "Transport" },
  ],
  loadItems: async (category) => CATALOG[category.slug],
  ...overrides,
});

const success = (result: Awaited<ReturnType<typeof buildBilan>>) => {
  if ("error" in result) throw new Error(`erreur inattendue : ${result.error}`);
  return result;
};

describe("buildBilan : calcul", () => {
  it("multiplie la quantité par le facteur d'émission", async () => {
    const result = success(
      await buildBilan(
        [{ categorySlug: "numerique", lines: [{ ref: "laptop", quantity: 2 }] }],
        deps(),
      ),
    );
    expect(result.total).toBe(312);
    expect(result.categories).toEqual([
      {
        name: "Numérique",
        subtotal: 312,
        lines: [
          { name: "Ordinateur portable", quantity: 2, unit: "unité", factor: 156, emissions: 312 },
        ],
      },
    ]);
  });

  it("additionne les lignes d'une catégorie puis les catégories", async () => {
    const input: BilanInput = [
      {
        categorySlug: "numerique",
        lines: [
          { ref: "laptop", quantity: 1 },
          { ref: "phone", quantity: 3 },
        ],
      },
      { categorySlug: "boisson", lines: [{ ref: "cafe", quantity: 10 }] },
    ];
    const result = success(await buildBilan(input, deps()));
    expect(result.categories.map((c) => c.subtotal)).toEqual([306, 2.5]);
    expect(result.total).toBeCloseTo(308.5);
  });

  it("garde l'ordre des catégories et applique la bonne unité", async () => {
    const input: BilanInput = [
      { categorySlug: "boisson", lines: [{ ref: "cafe", quantity: 1 }] },
      { categorySlug: "alimentation", lines: [{ ref: "repas-vegetarien", quantity: 4 }] },
      { categorySlug: "numerique", lines: [{ ref: "phone", quantity: 1 }] },
    ];
    const result = success(await buildBilan(input, deps()));
    expect(result.categories.map((c) => [c.name, c.lines[0].unit])).toEqual([
      ["Boisson", "L"],
      ["Alimentation (repas)", "repas"],
      ["Numérique", "unité"],
    ]);
  });

  it("multiplie la distance par le nombre de trajets pour le transport", async () => {
    const result = success(
      await buildBilan(
        [{ categorySlug: "transport", lines: [{ ref: "1", quantity: 12, trips: 3 }] }],
        deps(),
      ),
    );
    const line = result.categories[0].lines[0];
    expect(line).toMatchObject({ name: "Voiture thermique (x3)", quantity: 36, unit: "km" });
    expect(line.emissions).toBeCloseTo(7.2);
  });

  it("compte un seul trajet par défaut", async () => {
    const result = success(
      await buildBilan(
        [{ categorySlug: "transport", lines: [{ ref: "2", quantity: 100 }] }],
        deps(),
      ),
    );
    expect(result.categories[0].lines[0]).toMatchObject({ name: "Train (x1)", quantity: 100 });
    expect(result.total).toBeCloseTo(2);
  });

  it("ignore le nombre de trajets hors transport", async () => {
    const result = success(
      await buildBilan(
        [{ categorySlug: "boisson", lines: [{ ref: "cafe", quantity: 4, trips: 5 }] }],
        deps(),
      ),
    );
    expect(result.categories[0].lines[0].quantity).toBe(4);
  });

  it("omet une catégorie sans ligne, mais garde les autres", async () => {
    const result = success(
      await buildBilan(
        [
          { categorySlug: "numerique", lines: [] },
          { categorySlug: "boisson", lines: [{ ref: "cafe", quantity: 2 }] },
        ],
        deps(),
      ),
    );
    expect(result.categories.map((c) => c.name)).toEqual(["Boisson"]);
  });

  it("charge le catalogue de chaque catégorie une seule fois", async () => {
    const loadItems = vi.fn(async (c: { slug: string }) => CATALOG[c.slug]);
    await buildBilan(
      [
        { categorySlug: "numerique", lines: [{ ref: "laptop", quantity: 1 }] },
        { categorySlug: "boisson", lines: [{ ref: "cafe", quantity: 1 }] },
      ],
      deps({ loadItems }),
    );
    expect(loadItems).toHaveBeenCalledTimes(2);
  });
});

describe("buildBilan : erreurs", () => {
  it("refuse une entrée vide ou invalide", async () => {
    const message = "Sélectionne au moins une catégorie avec un élément.";
    expect(await buildBilan([], deps())).toEqual({ error: message });
    expect(await buildBilan(null as unknown as BilanInput, deps())).toEqual({ error: message });
  });

  it("refuse une catégorie inconnue", async () => {
    expect(
      await buildBilan([{ categorySlug: "inconnue", lines: [{ ref: "x", quantity: 1 }] }], deps()),
    ).toEqual({ error: "Catégorie invalide." });
  });

  it("refuse des lignes qui ne sont pas une liste", async () => {
    const input = [{ categorySlug: "numerique", lines: "oops" }] as unknown as BilanInput;
    expect(await buildBilan(input, deps())).toEqual({ error: "Catégorie invalide." });
  });

  it("refuse un élément absent du catalogue (les facteurs ne viennent jamais du client)", async () => {
    expect(
      await buildBilan(
        [{ categorySlug: "numerique", lines: [{ ref: "pirate", quantity: 1 }] }],
        deps(),
      ),
    ).toEqual({ error: "Élément invalide." });
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, 1e9 + 1, "5" as unknown as number])(
    "refuse la quantité %s",
    async (quantity) => {
      expect(
        await buildBilan(
          [{ categorySlug: "numerique", lines: [{ ref: "laptop", quantity }] }],
          deps(),
        ),
      ).toEqual({ error: "Quantité invalide pour « Ordinateur portable »." });
    },
  );

  it("accepte la quantité maximale autorisée", async () => {
    const result = await buildBilan(
      [{ categorySlug: "boisson", lines: [{ ref: "cafe", quantity: 1e9 }] }],
      deps(),
    );
    expect("total" in result).toBe(true);
  });

  it("refuse un nombre de trajets invalide", async () => {
    expect(
      await buildBilan(
        [{ categorySlug: "transport", lines: [{ ref: "1", quantity: 10, trips: 0 }] }],
        deps(),
      ),
    ).toEqual({ error: "Quantité invalide pour « Voiture thermique »." });
  });

  it("signale qu'il n'y a rien à calculer si toutes les catégories sont vides", async () => {
    expect(await buildBilan([{ categorySlug: "numerique", lines: [] }], deps())).toEqual({
      error: "Aucun élément renseigné.",
    });
  });

  it("signale l'indisponibilité du service Impact CO2", async () => {
    const result = await buildBilan(
      [{ categorySlug: "numerique", lines: [{ ref: "laptop", quantity: 1 }] }],
      deps({
        loadItems: async () => {
          throw new Error("HTTP 503");
        },
      }),
    );
    expect(result).toEqual({
      error: "Le service Impact CO2 est indisponible, réessaie plus tard.",
    });
  });
});
