// Script ponctuel, à relancer à la main si public/logo.svg change :
//   node scripts/generate-icons.mjs
// Rasterise le logo en PNG pour le favicon, l'icône Apple et le manifest PWA (public/icons/),
// avec sharp. N'est exécuté ni au build ni en CI (sharp est une dépendance optionnelle de Next,
// pas garantie sur toutes les plateformes) : les PNG générés sont commités une fois pour toutes.
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const CREAM = "#f6e9cf"; // doit rester identique à --cream dans src/app/globals.css
const svg = readFileSync("public/logo.svg");

mkdirSync("public/icons", { recursive: true });

async function icon(size, file) {
  await sharp(svg, { density: 384 }).resize(size, size).png().toFile(`public/icons/${file}`);
  console.log(`public/icons/${file}`);
}

// Favicon (plusieurs tailles) et icône Apple : fond transparent hors du cercle du logo.
await icon(16, "icon-16.png");
await icon(32, "icon-32.png");
await icon(48, "icon-48.png");
await icon(180, "apple-touch-icon.png");

// Manifest PWA : icônes normales, transparentes.
await icon(192, "icon-192.png");
await icon(512, "icon-512.png");

// Icône "maskable" : le cercle du logo occupe déjà ~80% du cadre (zone de sécurité recommandée),
// donc on l'étend juste sur un fond plein pour que les coins ne soient jamais transparents,
// quelle que soit la forme (cercle, carré arrondi...) que l'OS découpe par-dessus.
await sharp(svg, { density: 384 })
  .resize(512, 512)
  .flatten({ background: CREAM })
  .png()
  .toFile("public/icons/icon-512-maskable.png");
console.log("public/icons/icon-512-maskable.png");

// Logo en base64, pour les images Open Graph (src/app/**/opengraph-image.tsx) : ces routes
// tournent dans un environnement qui ne sait pas lire un fichier local via fetch(), un import
// direct est donc plus simple qu'un fetch("./og-logo.png", ...).
const ogLogo = await sharp(svg, { density: 384 }).resize(96, 96).png().toBuffer();
writeFileSync(
  "src/app/og-logo.ts",
  `// Généré par scripts/generate-icons.mjs à partir de public/logo.svg, ne pas modifier à la main.
export const OG_LOGO_DATA_URL = "data:image/png;base64,${ogLogo.toString("base64")}";
`,
);
console.log("src/app/og-logo.ts");
