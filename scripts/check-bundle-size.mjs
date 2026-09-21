// Contrôle du poids du JavaScript après `next build` :
//   npm run build && npm run size
// - affiche le JS chargé (gzip) au démarrage de chaque page ;
// - échoue si une page dépasse son budget ou si une librairie d'export lourde (PDF, Excel)
//   se retrouve dans le chargement initial : elle ne doit être chargée qu'au clic sur un export.
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { gzipSync } from "node:zlib";

const BUDGET_KB_GZIP = 220; // JS initial par page (mesuré à ~180-190 Ko lors de la mise en place)
const HEAVY_LIBS = [
  { name: "jsPDF", pattern: /jsPDF/ },
  { name: "jsPDF autotable", pattern: /autoTable/ },
  { name: "ExcelJS", pattern: /exceljs|ExcelJS/ },
  { name: "html2canvas", pattern: /html2canvas/ },
  { name: "canvg", pattern: /canvg/ },
];

const root = ".next";
if (!existsSync(join(root, "server", "app"))) {
  console.error("Aucun build trouvé : lance `npm run build` d'abord.");
  process.exit(1);
}

function walk(dir, ext) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path, ext) : path.endsWith(ext) ? [path] : [];
  });
}

const kb = (bytes) => `${(bytes / 1024).toFixed(1).padStart(7)} Ko`;

const chunks = new Map();
for (const file of walk(join(root, "static", "chunks"), ".js")) {
  const data = readFileSync(file);
  const text = data.toString("utf8");
  chunks.set(basename(file), {
    raw: data.length,
    gzip: gzipSync(data, { level: 6 }).length,
    libs: HEAVY_LIBS.filter((l) => l.pattern.test(text)).map((l) => l.name),
  });
}

console.log("Librairies d'export (chargées uniquement au clic) :");
const lazy = [...chunks].filter(([, c]) => c.libs.length);
for (const [name, c] of lazy.sort((a, b) => b[1].gzip - a[1].gzip)) {
  console.log(`  ${name.slice(0, 22).padEnd(22)} ${kb(c.raw)}  gzip ${kb(c.gzip)}  ${c.libs.join(", ")}`);
}

const pages = walk(join(root, "server", "app"), ".html").filter(
  (f) => !/_global-error|_not-found/.test(f),
);

console.log("\nJS chargé au démarrage (gzip) :");
let failed = false;
for (const file of pages) {
  const normalized = file.split(String.fromCharCode(92)).join("/");
  const relative = normalized.slice(normalized.indexOf("server/app/") + "server/app/".length);
  const route = "/" + relative.replace(/\.html$/, "").replace(/^index$/, "");
  const html = readFileSync(file, "utf8");
  const scripts = [...new Set([...html.matchAll(/\/_next\/static\/chunks\/([^"'?]+?\.js)/g)].map((m) => m[1]))];
  const total = scripts.reduce((sum, s) => sum + (chunks.get(basename(s))?.gzip ?? 0), 0);
  const heavy = scripts.filter((s) => chunks.get(basename(s))?.libs.length);

  const problems = [];
  if (total / 1024 > BUDGET_KB_GZIP) problems.push(`dépasse le budget de ${BUDGET_KB_GZIP} Ko`);
  if (heavy.length) problems.push(`charge une librairie d'export au démarrage (${heavy.join(", ")})`);
  if (problems.length) failed = true;

  console.log(`  ${route.padEnd(18)} ${kb(total)}  ${problems.length ? "✗ " + problems.join(" ; ") : "✓"}`);
}

if (failed) {
  console.error("\nÉchec : voir les lignes ✗ ci-dessus.");
  process.exit(1);
}
console.log(`\nOK : toutes les pages sont sous ${BUDGET_KB_GZIP} Ko gzip et sans librairie d'export au démarrage.`);
