import type { BilanResult } from "./types";

type Result = Extract<BilanResult, { total: number }>;
type Rgb = [number, number, number];

const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
const factorFormat = new Intl.NumberFormat("fr-FR", { maximumSignificantDigits: 3 });

// Les polices standard du PDF ne gèrent pas les espaces insécables produits par Intl.
const pdfText = (s: string) => s.replace(/[  ]/g, " ");

const FOREST: Rgb = [7, 80, 74];
const NIGHT: Rgb = [36, 40, 120];
const INK: Rgb = [20, 37, 54];
const CREAM: Rgb = [246, 233, 207];
const CREAM_SOFT: Rgb = [251, 244, 228];
const TRACK: Rgb = [232, 220, 196];

const PALETTE: { fill: Rgb; text: Rgb }[] = [
  { fill: [154, 203, 120], text: INK },
  { fill: [82, 182, 232], text: INK },
  { fill: [227, 170, 59], text: INK },
  { fill: [66, 168, 120], text: INK },
  { fill: [35, 128, 226], text: CREAM_SOFT },
  { fill: NIGHT, text: CREAM_SOFT },
  { fill: FOREST, text: CREAM_SOFT },
];

function fileName(ext: string) {
  const day = new Date().toISOString().slice(0, 10);
  return `bilan-carbone-harmony-${day}.${ext}`;
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Précharge les librairies (lourdes) quand l'utilisateur s'apprête à exporter : le clic paraît alors instantané.
export const preloadPdf = () => Promise.all([import("jspdf"), import("jspdf-autotable")]);
export const preloadExcel = () => import("exceljs");

// Génération des fichiers : utilisable côté navigateur (téléchargement) et côté serveur (historique).
export async function buildPdf(result: Result): Promise<ArrayBuffer> {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 30;
  const top = 78;
  const bottom = H - 30;
  const now = new Date();
  const lineCount = result.categories.reduce((n, c) => n + c.lines.length, 0);

  // Bandeau
  doc.setFillColor(...FOREST);
  doc.rect(0, 0, W, 54, "F");
  doc.setFillColor(...PALETTE[0].fill);
  doc.rect(0, 54, W, 3, "F");
  doc.setTextColor(...CREAM);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Bilan carbone", M, 35);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    `Harmony  |  ${now.toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" })} à ${now.toLocaleTimeString("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" })}`,
    W - M,
    33,
    { align: "right" },
  );

  // Panneau de gauche : total + répartition
  const panelW = 220;
  doc.setFillColor(...CREAM_SOFT);
  doc.roundedRect(M, top, panelW, bottom - top, 10, 10, "F");

  doc.setTextColor(...FOREST);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("TOTAL DES CATÉGORIES INCLUSES", M + 16, top + 24);
  doc.setTextColor(...NIGHT);
  doc.setFontSize(32);
  doc.text(pdfText(nf.format(result.total)), M + 16, top + 60);
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "normal");
  doc.text("kgCO2e", M + 16, top + 78);

  const listTop = top + 108;
  const listBottom = bottom - 44;
  const step = Math.min(44, (listBottom - listTop) / Math.max(result.categories.length, 1));
  const barX = M + 16;
  const barW = panelW - 32;

  doc.setTextColor(...FOREST);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("RÉPARTITION", barX, listTop - 10);

  result.categories.forEach((c, i) => {
    const y = listTop + i * step;
    const pct = result.total > 0 ? c.subtotal / result.total : 0;
    const color = PALETTE[i % PALETTE.length].fill;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(pdfText(c.name), barX, y + 6, { maxWidth: barW - 70 });
    doc.setFont("helvetica", "normal");
    doc.text(pdfText(`${nf.format(c.subtotal)} kgCO2e`), barX + barW, y + 6, { align: "right" });
    doc.setFillColor(...TRACK);
    doc.roundedRect(barX, y + 11, barW, 6, 3, 3, "F");
    doc.setFillColor(...color);
    doc.roundedRect(barX, y + 11, Math.max(barW * pct, 4), 6, 3, 3, "F");
    doc.setFontSize(7);
    doc.setTextColor(90, 100, 110);
    doc.text(pdfText(`${nf.format(pct * 100)} %`), barX, y + 27);
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(90, 100, 110);
  doc.text(
    `${result.categories.length} catégorie${result.categories.length > 1 ? "s" : ""}  |  ${lineCount} élément${lineCount > 1 ? "s" : ""}`,
    barX,
    bottom - 26,
  );
  doc.text("Facteurs d'émission : Impact CO2 (ADEME)", barX, bottom - 15);

  // Détail : toutes les lignes sur une seule page (police et colonnes adaptées)
  const areaX = M + panelW + 18;
  const areaW = W - M - areaX;
  const totalRows = result.categories.reduce((n, c) => n + 1 + c.lines.length, 0);
  const cols = totalRows <= 34 ? 1 : totalRows <= 68 ? 2 : 3;
  const perCol = Math.ceil(totalRows / cols);
  const gap = 10;
  const colW = (areaW - gap * (cols - 1)) / cols;
  const rowH = Math.min(18, (bottom - top) / (perCol + 2));
  const pad = rowH >= 13 ? 2.5 : 1;
  const fs = Math.max(4.5, Math.min(8, (rowH - pad * 2) / 1.25));
  const showFactor = cols === 1;

  type Cell = string | { content: string; colSpan?: number; styles?: Record<string, unknown> };
  const columns: Cell[][][] = Array.from({ length: cols }, () => []);
  let colIdx = 0;
  const headerRow = (name: string, subtotal: number, i: number): Cell[] => {
    const p = PALETTE[i % PALETTE.length];
    const base = { fillColor: p.fill, textColor: p.text, fontStyle: "bold" };
    return [
      { content: pdfText(name), colSpan: showFactor ? 3 : 2, styles: base },
      { content: pdfText(nf.format(subtotal)), styles: { ...base, halign: "right" } },
    ];
  };

  result.categories.forEach((c, i) => {
    let started = false;
    for (const l of c.lines) {
      if (columns[colIdx].length >= perCol && colIdx < cols - 1) colIdx++;
      if (!started || columns[colIdx].length === 0) {
        columns[colIdx].push(headerRow(started ? `${c.name} (suite)` : c.name, c.subtotal, i));
        started = true;
      }
      const row: Cell[] = [
        pdfText(l.name),
        pdfText(`${nf.format(l.quantity)} ${l.unit}`),
      ];
      if (showFactor) row.push(pdfText(factorFormat.format(l.factor)));
      row.push(pdfText(nf.format(l.emissions)));
      columns[colIdx].push(row);
    }
    if (c.lines.length === 0) {
      if (columns[colIdx].length >= perCol && colIdx < cols - 1) colIdx++;
      columns[colIdx].push(headerRow(c.name, c.subtotal, i));
    }
  });

  columns.forEach((body, ci) => {
    if (body.length === 0) return;
    autoTable(doc, {
      startY: top,
      margin: { left: areaX + ci * (colW + gap), right: W - (areaX + ci * (colW + gap) + colW) },
      tableWidth: colW,
      theme: "plain",
      head: [
        showFactor
          ? ["Élément", "Quantité", "Facteur", "kgCO2e"]
          : ["Élément", "Quantité", "kgCO2e"],
      ],
      body: body as never,
      styles: {
        font: "helvetica",
        fontSize: fs,
        textColor: INK,
        cellPadding: { top: pad, bottom: pad, left: 4, right: 4 },
        overflow: "ellipsize",
        lineWidth: 0,
      },
      headStyles: { fillColor: INK, textColor: CREAM, fontStyle: "bold" },
      alternateRowStyles: { fillColor: CREAM_SOFT },
      columnStyles: showFactor
        ? {
            1: { cellWidth: 70, halign: "right" },
            2: { cellWidth: 50, halign: "right" },
            3: { cellWidth: 56, halign: "right" },
          }
        : {
            1: { cellWidth: Math.min(64, colW * 0.3), halign: "right" },
            2: { cellWidth: Math.min(44, colW * 0.22), halign: "right" },
          },
    });
  });

  return doc.output("arraybuffer");
}

export async function buildExcel(result: Result): Promise<ArrayBuffer> {
  // Selon le contexte (navigateur ou Node), la classe est sur le module ou sur son export par défaut.
  type ExcelJS = typeof import("exceljs");
  const excel = (await import("exceljs")) as ExcelJS & { default?: ExcelJS };
  const Workbook = excel.Workbook ?? excel.default!.Workbook;
  const wb = new Workbook();
  wb.creator = "Harmony";
  wb.created = new Date();

  const now = new Date();
  const lines = result.categories.flatMap((c) =>
    c.lines.map((l) => ({ category: c.name, categoryTotal: c.subtotal, ...l })),
  );
  const top = result.categories.reduce<Result["categories"][number] | null>(
    (best, c) => (!best || c.subtotal > best.subtotal ? c : best),
    null,
  );

  const headerFill = {
    type: "pattern" as const,
    pattern: "solid" as const,
    fgColor: { argb: "FF07504A" },
  };
  const headerFont = { bold: true, color: { argb: "FFF6E9CF" } };
  const band = {
    type: "pattern" as const,
    pattern: "solid" as const,
    fgColor: { argb: "FFFBF4E4" },
  };
  const border = { style: "thin" as const, color: { argb: "FFE0D2B0" } };
  const cellBorder = { top: border, bottom: border, left: border, right: border };

  function styleSheet(sheet: import("exceljs").Worksheet, dataRows: number) {
    const header = sheet.getRow(1);
    header.font = headerFont;
    header.fill = headerFill;
    header.height = 24;
    header.alignment = { vertical: "middle", wrapText: true };
    for (let r = 1; r <= dataRows + 1; r++) {
      sheet.getRow(r).eachCell((cell) => {
        cell.border = cellBorder;
        if (r > 1 && r % 2 === 1) cell.fill = band;
      });
    }
    sheet.views = [{ state: "frozen", ySplit: 1 }];
  }

  // Synthèse
  const summary = wb.addWorksheet("Synthèse", { properties: { tabColor: { argb: "FF07504A" } } });
  summary.columns = [
    { header: "Catégorie", key: "name", width: 30 },
    { header: "Nombre d'éléments", key: "count", width: 20, style: { numFmt: "0" } },
    { header: "Émissions (kgCO2e)", key: "subtotal", width: 22, style: { numFmt: "#,##0.00" } },
    { header: "Part du total", key: "share", width: 16, style: { numFmt: "0.0%" } },
    { header: "Émissions moyennes par élément (kgCO2e)", key: "avg", width: 30, style: { numFmt: "#,##0.00" } },
  ];
  result.categories.forEach((c, i) => {
    const r = i + 2;
    summary.addRow({
      name: c.name,
      count: c.lines.length,
      subtotal: c.subtotal,
      share: { formula: `IF($C$${result.categories.length + 2}=0,0,C${r}/$C$${result.categories.length + 2})` },
      avg: { formula: `IF(B${r}=0,0,C${r}/B${r})` },
    });
  });
  const last = result.categories.length + 1;
  const totalRow = summary.addRow({
    name: "Total",
    count: { formula: `SUM(B2:B${last})` },
    subtotal: { formula: `SUM(C2:C${last})` },
    share: { formula: `SUM(D2:D${last})` },
    avg: { formula: `IF(B${last + 1}=0,0,C${last + 1}/B${last + 1})` },
  });
  styleSheet(summary, result.categories.length + 1);
  totalRow.font = { bold: true, color: { argb: "FF242878" } };
  totalRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8DCC4" } };
  summary.getRow(1).getCell(1).alignment = { vertical: "middle" };

  const topLines = [...lines].sort((a, b) => b.emissions - a.emissions).slice(0, 5);
  const topStart = last + 4;
  summary.getCell(`A${topStart - 1}`).value = "Top 5 des éléments les plus émetteurs";
  summary.getCell(`A${topStart - 1}`).font = { bold: true, size: 12, color: { argb: "FF07504A" } };
  ["Élément", "Catégorie", "Émissions (kgCO2e)", "Part du total"].forEach((h, i) => {
    const cell = summary.getRow(topStart).getCell(i + 1);
    cell.value = h;
    cell.font = headerFont;
    cell.fill = headerFill;
    cell.border = cellBorder;
  });
  topLines.forEach((l, i) => {
    const row = summary.getRow(topStart + 1 + i);
    row.getCell(1).value = l.name;
    row.getCell(2).value = l.category;
    row.getCell(3).value = l.emissions;
    row.getCell(3).numFmt = "#,##0.00";
    row.getCell(4).value = { formula: `IF($C$${last + 1}=0,0,C${topStart + 1 + i}/$C$${last + 1})` };
    row.getCell(4).numFmt = "0.0%";
    row.eachCell((cell) => (cell.border = cellBorder));
  });

  // Détail
  const detail = wb.addWorksheet("Détail", { properties: { tabColor: { argb: "FF42A878" } } });
  detail.columns = [
    { header: "Catégorie", key: "category", width: 26 },
    { header: "Élément", key: "name", width: 46 },
    { header: "Quantité", key: "quantity", width: 14, style: { numFmt: "#,##0.00" } },
    { header: "Unité", key: "unit", width: 14 },
    { header: "Facteur d'émission (kgCO2e/unité)", key: "factor", width: 30, style: { numFmt: "0.000" } },
    { header: "Émissions (kgCO2e)", key: "emissions", width: 20, style: { numFmt: "#,##0.00" } },
    { header: "Part de la catégorie", key: "inCat", width: 20, style: { numFmt: "0.0%" } },
    { header: "Part du total", key: "inTotal", width: 16, style: { numFmt: "0.0%" } },
  ];
  const n = lines.length;
  lines.forEach((l, i) => {
    const r = i + 2;
    detail.addRow({
      category: l.category,
      name: l.name,
      quantity: l.quantity,
      unit: l.unit,
      factor: l.factor,
      emissions: l.emissions,
      inCat: l.categoryTotal > 0 ? l.emissions / l.categoryTotal : 0,
      inTotal: { formula: `IF($F$${n + 2}=0,0,F${r}/$F$${n + 2})` },
    });
  });
  const detailTotal = detail.addRow({
    category: "Total",
    emissions: { formula: `SUM(F2:F${n + 1})` },
  });
  styleSheet(detail, n + 1);
  detailTotal.font = { bold: true, color: { argb: "FF242878" } };
  detailTotal.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8DCC4" } };
  detail.autoFilter = { from: "A1", to: `H${n + 1}` };
  if (n > 0) {
    detail.addConditionalFormatting({
      ref: `F2:F${n + 1}`,
      rules: [
        {
          type: "dataBar",
          priority: 1,
          gradient: true,
          color: { argb: "FF9ACB78" },
          minLength: 0,
          maxLength: 100,
          cfvo: [{ type: "min" }, { type: "max" }],
        } as never,
      ],
    });
  }

  // Infos
  const info = wb.addWorksheet("Infos", { properties: { tabColor: { argb: "FFE3AA3B" } } });
  info.columns = [
    { header: "Information", key: "k", width: 36 },
    { header: "Valeur", key: "v", width: 60 },
  ];
  const rows: [string, string | number][] = [
    ["Rapport", "Bilan carbone Harmony"],
    ["Date de génération", now.toLocaleString("fr-FR", { timeZone: "Europe/Paris" })],
    ["Total (kgCO2e)", result.total],
    ["Nombre de catégories", result.categories.length],
    ["Nombre d'éléments", n],
    ["Catégorie la plus émettrice", top ? `${top.name} (${nf.format(top.subtotal)} kgCO2e)` : "-"],
    [
      "Élément le plus émetteur",
      topLines[0] ? `${topLines[0].name} (${nf.format(topLines[0].emissions)} kgCO2e)` : "-",
    ],
    ["Unité", "kgCO2e (kilogrammes équivalent CO2)"],
    ["Méthode", "Émissions = quantité x facteur d'émission (x nombre de trajets pour le transport)"],
    ["Source des facteurs", "Impact CO2 (ADEME) - https://impactco2.fr"],
  ];
  rows.forEach(([k, v]) => info.addRow({ k, v }));
  info.getCell("B4").numFmt = "#,##0.00";
  styleSheet(info, rows.length);
  info.eachRow((row, r) => {
    if (r > 1) row.getCell(1).font = { bold: true };
    row.getCell(2).alignment = { horizontal: "left", wrapText: true, vertical: "top" };
  });

  return (await wb.xlsx.writeBuffer()) as ArrayBuffer;
}

const XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export async function exportPdf(result: Result) {
  download(new Blob([await buildPdf(result)], { type: "application/pdf" }), fileName("pdf"));
}

export async function exportExcel(result: Result) {
  download(new Blob([await buildExcel(result)], { type: XLSX_TYPE }), fileName("xlsx"));
}
