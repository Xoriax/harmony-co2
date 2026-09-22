import { describe, expect, it } from "vitest";
import { computeBilanStats } from "@/lib/bilan-stats";

describe("computeBilanStats", () => {
  it("renvoie des totaux à zéro sans bilan", () => {
    const stats = computeBilanStats([]);
    expect(stats).toEqual({ count: 0, totalEmissions: 0, averageTotal: 0, topCategories: [] });
  });

  it("additionne le total et calcule la moyenne", () => {
    const stats = computeBilanStats([
      { total: 100, categories: [] },
      { total: 300, categories: [] },
    ]);
    expect(stats.count).toBe(2);
    expect(stats.totalEmissions).toBe(400);
    expect(stats.averageTotal).toBe(200);
  });

  it("cumule les catégories entre plusieurs bilans", () => {
    const stats = computeBilanStats([
      { total: 100, categories: [{ name: "Numérique", subtotal: 80, count: 2 }] },
      { total: 60, categories: [{ name: "Numérique", subtotal: 20, count: 1 }] },
    ]);
    expect(stats.topCategories).toEqual([{ name: "Numérique", subtotal: 100, count: 3 }]);
  });

  it("trie les catégories par émissions cumulées décroissantes", () => {
    const stats = computeBilanStats([
      {
        total: 150,
        categories: [
          { name: "Mobilier", subtotal: 50, count: 1 },
          { name: "Transport", subtotal: 100, count: 3 },
        ],
      },
    ]);
    expect(stats.topCategories.map((c) => c.name)).toEqual(["Transport", "Mobilier"]);
  });
});
