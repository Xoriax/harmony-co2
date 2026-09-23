import { describe, expect, it } from "vitest";
import { matchesBilanFilters } from "@/lib/bilan-filter";
import type { BilanRow } from "@/lib/bilans";

const bilan: BilanRow = {
  id: "1",
  total: 120,
  categories: [
    { name: "Numérique", subtotal: 80, count: 2 },
    { name: "Transport", subtotal: 40, count: 1 },
  ],
  pdf_path: "x.pdf",
  xlsx_path: "x.xlsx",
  created_at: "2026-06-15T10:00:00.000Z",
  association_name: "Association Test",
};

describe("matchesBilanFilters", () => {
  it("accepte tout sans filtre", () => {
    expect(matchesBilanFilters(bilan, { category: null, from: null, to: null })).toBe(true);
  });

  it("filtre par catégorie présente dans le bilan", () => {
    expect(matchesBilanFilters(bilan, { category: "Transport", from: null, to: null })).toBe(true);
    expect(matchesBilanFilters(bilan, { category: "Boisson", from: null, to: null })).toBe(false);
  });

  it("filtre par date de début", () => {
    expect(matchesBilanFilters(bilan, { category: null, from: "2026-06-01", to: null })).toBe(true);
    expect(matchesBilanFilters(bilan, { category: null, from: "2026-07-01", to: null })).toBe(
      false,
    );
  });

  it("filtre par date de fin", () => {
    expect(matchesBilanFilters(bilan, { category: null, from: null, to: "2026-06-30" })).toBe(true);
    expect(matchesBilanFilters(bilan, { category: null, from: null, to: "2026-06-01" })).toBe(
      false,
    );
  });

  it("combine catégorie et plage de dates", () => {
    const filters = { category: "Numérique", from: "2026-06-10", to: "2026-06-20" };
    expect(matchesBilanFilters(bilan, filters)).toBe(true);
    expect(matchesBilanFilters(bilan, { ...filters, category: "Boisson" })).toBe(false);
  });
});
