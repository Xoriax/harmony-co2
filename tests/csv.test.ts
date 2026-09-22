import { describe, expect, it } from "vitest";
import { bilanCategoriesToCsv, bilanLinesToCsv } from "@/lib/csv";

describe("bilanLinesToCsv", () => {
  it("commence par l'indicateur UTF-8 et l'en-tête", () => {
    const csv = bilanLinesToCsv([], 0);
    expect(csv.startsWith("﻿Catégorie,Élément")).toBe(true);
  });

  it("écrit une ligne par élément puis le total", () => {
    const csv = bilanLinesToCsv(
      [
        {
          categorie: "Numérique",
          element: "Smartphone",
          quantite: 2,
          unite: "unité",
          facteur: 80.16,
          emissions: 160.31,
        },
      ],
      160.31,
    );
    const rows = csv.trim().split("\r\n");
    expect(rows).toHaveLength(3); // en-tête, ligne, total
    expect(rows[1]).toBe("Numérique,Smartphone,2,unité,80.16,160.31");
    expect(rows[2]).toBe(",,,,Total,160.31");
  });

  it("met entre guillemets un champ contenant une virgule", () => {
    const csv = bilanLinesToCsv(
      [
        {
          categorie: "Alimentation",
          element: "Repas, végétarien",
          quantite: 1,
          unite: "repas",
          facteur: 0.85,
          emissions: 0.85,
        },
      ],
      0.85,
    );
    expect(csv).toContain('"Repas, végétarien"');
  });
});

describe("bilanCategoriesToCsv", () => {
  it("écrit une ligne par catégorie puis le total", () => {
    const csv = bilanCategoriesToCsv(
      [{ categorie: "Numérique", sousTotal: 160.31, nombreElements: 1 }],
      160.31,
    );
    const rows = csv.trim().split("\r\n");
    expect(rows[1]).toBe("Numérique,160.31,1");
    expect(rows[2]).toBe("Total,160.31,");
  });
});
