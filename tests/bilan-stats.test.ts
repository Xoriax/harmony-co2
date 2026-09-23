import { describe, expect, it } from "vitest";
import { computeBilanStats } from "@/lib/bilan-stats";

describe("computeBilanStats", () => {
  it("renvoie des totaux à zéro sans bilan", () => {
    const stats = computeBilanStats([]);
    expect(stats).toEqual({
      count: 0,
      totalEmissions: 0,
      averageTotal: 0,
      topCategories: [],
      monthly: [],
      monthComparison: null,
    });
  });

  it("additionne le total et calcule la moyenne", () => {
    const stats = computeBilanStats([
      { total: 100, categories: [], created_at: "2026-06-15T10:00:00Z" },
      { total: 300, categories: [], created_at: "2026-06-20T10:00:00Z" },
    ]);
    expect(stats.count).toBe(2);
    expect(stats.totalEmissions).toBe(400);
    expect(stats.averageTotal).toBe(200);
  });

  it("cumule les catégories entre plusieurs bilans", () => {
    const stats = computeBilanStats([
      {
        total: 100,
        categories: [{ name: "Numérique", subtotal: 80, count: 2 }],
        created_at: "2026-06-15T10:00:00Z",
      },
      {
        total: 60,
        categories: [{ name: "Numérique", subtotal: 20, count: 1 }],
        created_at: "2026-06-16T10:00:00Z",
      },
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
        created_at: "2026-06-15T10:00:00Z",
      },
    ]);
    expect(stats.topCategories.map((c) => c.name)).toEqual(["Transport", "Mobilier"]);
  });
});

describe("computeBilanStats : total par mois", () => {
  it("regroupe les bilans par mois, à Paris, du plus ancien au plus récent", () => {
    const stats = computeBilanStats([
      { total: 100, categories: [], created_at: "2026-07-15T10:00:00Z" },
      { total: 50, categories: [], created_at: "2026-06-01T23:30:00Z" }, // 2026-06-02 à Paris
      { total: 30, categories: [], created_at: "2026-07-20T10:00:00Z" },
    ]);
    expect(stats.monthly).toEqual([
      { month: "2026-06", label: "juin 2026", total: 50, count: 1 },
      { month: "2026-07", label: "juillet 2026", total: 130, count: 2 },
    ]);
  });

  it("ne comble pas les mois sans bilan", () => {
    const stats = computeBilanStats([
      { total: 10, categories: [], created_at: "2026-01-15T10:00:00Z" },
      { total: 20, categories: [], created_at: "2026-09-15T10:00:00Z" },
    ]);
    expect(stats.monthly.map((m) => m.month)).toEqual(["2026-01", "2026-09"]);
  });

  it("compare les deux mois les plus récents ayant un bilan", () => {
    const stats = computeBilanStats([
      { total: 100, categories: [], created_at: "2026-05-15T10:00:00Z" },
      { total: 80, categories: [], created_at: "2026-07-15T10:00:00Z" },
      { total: 120, categories: [], created_at: "2026-08-15T10:00:00Z" },
    ]);
    expect(stats.monthComparison).toEqual({
      previous: { month: "2026-07", label: "juillet 2026", total: 80, count: 1 },
      current: { month: "2026-08", label: "août 2026", total: 120, count: 1 },
      deltaPct: 50,
    });
  });

  it("ne compare rien avec un seul mois de données", () => {
    const stats = computeBilanStats([
      { total: 100, categories: [], created_at: "2026-05-15T10:00:00Z" },
    ]);
    expect(stats.monthComparison).toBeNull();
  });

  it("renvoie un écart nul quand le mois précédent est à zéro", () => {
    const stats = computeBilanStats([
      { total: 0, categories: [], created_at: "2026-07-15T10:00:00Z" },
      { total: 50, categories: [], created_at: "2026-08-15T10:00:00Z" },
    ]);
    expect(stats.monthComparison?.deltaPct).toBeNull();
  });
});
