import type { LeafSpec } from "./leaf-layer";

const COLORS: LeafSpec["color"][] = ["leaf", "emerald", "gold"];

// Générateur pseudo-aléatoire déterministe : le serveur et le navigateur produisent les mêmes
// feuilles (pas d'écart d'hydratation), mais chaque page en obtient de différentes.
function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const between = (r: () => number, min: number, max: number) => min + r() * (max - min);
const cache = new Map<string, LeafSpec[]>();

/**
 * Feuilles réparties sur toute la hauteur d'une page à fond clair : environ 16, de tailles très
 * variées (de 22 à 78 px), surtout sur les bords, quelques-unes plus à l'intérieur.
 * Chaque `seed` (une par page) donne une disposition et des tailles différentes.
 */
export function sideLeaves(seed: string): LeafSpec[] {
  const cached = cache.get(seed);
  if (cached) return cached;

  const r = rng(seed);
  const count = 16;
  const leaves: LeafSpec[] = [];

  for (let i = 0; i < count; i++) {
    const inland = i % 5 === 4;
    const left = i % 2 === 0;
    const size = Math.round(between(r, 22, 78));
    // Répartition régulière en hauteur, avec un jitter pour éviter l'alignement.
    const y = ((i + between(r, 0.1, 0.9)) / count) * 96 + 1;
    const x = inland ? between(r, 12, 84) : left ? between(r, -1, 7) : between(r, 91, 99);

    leaves.push({
      x: `${x.toFixed(1)}%`,
      y: `${y.toFixed(1)}%`,
      size,
      color: COLORS[Math.floor(r() * COLORS.length)],
      speed: Number((between(r, 0.05, 0.11) * (r() < 0.5 ? -1 : 1)).toFixed(3)),
      spin: Number((between(r, 0.02, 0.05) * (r() < 0.5 ? -1 : 1)).toFixed(3)),
      dur: Math.round(between(r, 7, 11)),
      delay: -Math.round(between(r, 0, 6)),
      rot: Math.round(between(r, -90, 270)),
      // Sur mobile : on garde les grandes feuilles des bords, pas les petites ni celles du centre.
      hideOnMobile: inland || i % 3 === 0,
    });
  }

  cache.set(seed, leaves);
  return leaves;
}

// Pour les bandes vert sapin (le calque de page est masqué derrière leur fond plein).
export const DARK_LEAVES: LeafSpec[] = [
  {
    x: "3%",
    y: "6%",
    size: 44,
    color: "leaf",
    speed: -0.14,
    spin: 0.05,
    dur: 8,
    delay: 0,
    rot: 20,
  },
  {
    x: "94%",
    y: "16%",
    size: 50,
    color: "emerald",
    speed: -0.12,
    spin: 0.04,
    dur: 7,
    delay: -2,
    rot: -50,
  },
  {
    x: "48%",
    y: "92%",
    size: 38,
    color: "gold",
    speed: 0.15,
    spin: 0.06,
    dur: 10,
    delay: -5,
    rot: 210,
    hideOnMobile: true,
  },
  {
    x: "92%",
    y: "84%",
    size: 34,
    color: "leaf",
    speed: -0.2,
    spin: -0.05,
    dur: 8,
    delay: -1,
    rot: 140,
  },
];
