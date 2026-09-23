import { describe, expect, it } from "vitest";
import { matchesAdminBilanFilters, matchesBilanFilters } from "@/lib/bilan-filter";
import type { AdminBilanRow, BilanRow } from "@/lib/bilans";

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

describe("matchesAdminBilanFilters", () => {
  const adminBilan: AdminBilanRow = { ...bilan, user_id: "42", user_name: "Camille" };

  it("accepte tout sans filtre", () => {
    expect(matchesAdminBilanFilters(adminBilan, { association: null, year: null })).toBe(true);
  });

  it("filtre par nom d'association, insensible à la casse et en sous-chaîne", () => {
    expect(matchesAdminBilanFilters(adminBilan, { association: "association", year: null })).toBe(
      true,
    );
    expect(matchesAdminBilanFilters(adminBilan, { association: "TEST", year: null })).toBe(true);
    expect(matchesAdminBilanFilters(adminBilan, { association: "Harmony", year: null })).toBe(
      false,
    );
  });

  it("ignore un filtre d'association vide ou fait uniquement d'espaces", () => {
    expect(matchesAdminBilanFilters(adminBilan, { association: "", year: null })).toBe(true);
    expect(matchesAdminBilanFilters(adminBilan, { association: "   ", year: null })).toBe(true);
  });

  it("filtre par année (à Paris)", () => {
    expect(matchesAdminBilanFilters(adminBilan, { association: null, year: 2026 })).toBe(true);
    expect(matchesAdminBilanFilters(adminBilan, { association: null, year: 2025 })).toBe(false);
  });

  it("combine les deux filtres", () => {
    const filters = { association: "test", year: 2026 };
    expect(matchesAdminBilanFilters(adminBilan, filters)).toBe(true);
    expect(matchesAdminBilanFilters(adminBilan, { ...filters, year: 2025 })).toBe(false);
  });
});
