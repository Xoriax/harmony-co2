// Indicateur UTF-8 : sans lui, Excel (Windows) n'affiche pas correctement les accents.
const BOM = "﻿";

// Un champ CSV : entre guillemets s'il contient une virgule, un guillemet ou un saut de ligne
// (RFC 4180 simplifiée, suffisante pour nos données).
function csvField(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function csvLine(fields: (string | number)[]): string {
  return fields.map(csvField).join(",") + "\r\n";
}

export type BilanCsvLine = {
  categorie: string;
  element: string;
  quantite: number;
  unite: string;
  facteur: number;
  emissions: number;
};

// Détail ligne à ligne, utilisé sur /bilan (à partir d'un calcul en cours).
export function bilanLinesToCsv(lines: BilanCsvLine[], total: number): string {
  let csv =
    BOM +
    csvLine([
      "Catégorie",
      "Élément",
      "Quantité",
      "Unité",
      "Facteur (kgCO2e/unité)",
      "Émissions (kgCO2e)",
    ]);
  for (const line of lines) {
    csv += csvLine([
      line.categorie,
      line.element,
      line.quantite,
      line.unite,
      line.facteur,
      line.emissions,
    ]);
  }
  csv += csvLine(["", "", "", "", "Total", total]);
  return csv;
}

export type BilanCategoryCsvLine = { categorie: string; sousTotal: number; nombreElements: number };

// Vue par catégorie, utilisée sur /historique : seuls le nom, le sous-total et le nombre
// d'éléments par catégorie sont enregistrés à la génération du bilan (pas le détail ligne à ligne).
export function bilanCategoriesToCsv(lines: BilanCategoryCsvLine[], total: number): string {
  let csv = BOM + csvLine(["Catégorie", "Sous-total (kgCO2e)", "Nombre d'éléments"]);
  for (const line of lines) csv += csvLine([line.categorie, line.sousTotal, line.nombreElements]);
  csv += csvLine(["Total", total, ""]);
  return csv;
}
