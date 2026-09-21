import Image from "next/image";
import Link from "next/link";
import { GlobeScene } from "./globe-scene";
import LeafLayer, { type LeafSpec } from "./leaf-layer";
import { SiteHeader } from "./site-header";

const CARDS = [
  {
    href: "/bilan",
    tone: "bg-leaf",
    title: "Mon bilan",
    text: "Sélectionne tes catégories (numérique, repas, transport…) et calcule ton empreinte carbone.",
    cta: "Calculer un bilan",
  },
  {
    href: "/event",
    tone: "bg-sky",
    title: "Événements",
    text: "Retrouve les prochains événements, avec leurs dates, leur lieu et un compte à rebours.",
    cta: "Voir les événements",
  },
  {
    href: "/mandat",
    tone: "bg-gold",
    title: "Mandat",
    text: "Découvre le Responsable RSE et le Bureau restreint, et comment les contacter.",
    cta: "Voir l'équipe",
  },
];

const STEPS = [
  "Choisis les catégories qui concernent ton association.",
  "Renseigne les quantités : repas, distances, appareils…",
  "Télécharge ton bilan en PDF ou en Excel.",
];

const HIGHLIGHTS = [
  "Facteurs Impact CO2 (ADEME)",
  "Export PDF et Excel",
  "Historique de tes bilans",
];

const HERO_LEAVES: LeafSpec[] = [
  {
    x: "2%",
    y: "9%",
    size: 46,
    color: "leaf",
    speed: -0.12,
    spin: 0.04,
    dur: 7,
    delay: 0,
    rot: -20,
  },
  {
    x: "40%",
    y: "5%",
    size: 30,
    color: "gold",
    speed: 0.16,
    spin: -0.05,
    dur: 9,
    delay: -2,
    rot: 30,
    hideOnMobile: true,
  },
  {
    x: "91%",
    y: "8%",
    size: 36,
    color: "emerald",
    speed: -0.18,
    spin: 0.05,
    dur: 8,
    delay: -4,
    rot: 70,
  },
  {
    x: "4%",
    y: "80%",
    size: 54,
    color: "gold",
    speed: 0.14,
    spin: 0.03,
    dur: 10,
    delay: -3,
    rot: 120,
  },
  {
    x: "50%",
    y: "86%",
    size: 34,
    color: "emerald",
    speed: -0.2,
    spin: -0.04,
    dur: 8,
    delay: -5,
    rot: 200,
    hideOnMobile: true,
  },
  {
    x: "88%",
    y: "84%",
    size: 42,
    color: "leaf",
    speed: 0.12,
    spin: 0.06,
    dur: 9,
    delay: -1,
    rot: 160,
  },
];

const CARDS_LEAVES: LeafSpec[] = [
  {
    x: "1%",
    y: "6%",
    size: 40,
    color: "emerald",
    speed: -0.14,
    spin: 0.05,
    dur: 8,
    delay: -1,
    rot: 40,
  },
  {
    x: "93%",
    y: "14%",
    size: 48,
    color: "leaf",
    speed: 0.15,
    spin: -0.04,
    dur: 9,
    delay: -3,
    rot: -30,
  },
  {
    x: "96%",
    y: "72%",
    size: 30,
    color: "gold",
    speed: -0.18,
    spin: 0.06,
    dur: 7,
    delay: -2,
    rot: 90,
    hideOnMobile: true,
  },
  {
    x: "2%",
    y: "90%",
    size: 36,
    color: "leaf",
    speed: 0.12,
    spin: -0.05,
    dur: 10,
    delay: -4,
    rot: 150,
  },
];

const BAND_LEAVES: LeafSpec[] = [
  {
    x: "3%",
    y: "5%",
    size: 44,
    color: "leaf",
    speed: -0.14,
    spin: 0.05,
    dur: 8,
    delay: 0,
    rot: 20,
  },
  {
    x: "47%",
    y: "3%",
    size: 32,
    color: "gold",
    speed: 0.17,
    spin: -0.05,
    dur: 9,
    delay: -3,
    rot: 100,
    hideOnMobile: true,
  },
  {
    x: "94%",
    y: "18%",
    size: 50,
    color: "emerald",
    speed: -0.12,
    spin: 0.04,
    dur: 7,
    delay: -2,
    rot: -50,
  },
  {
    x: "49%",
    y: "90%",
    size: 40,
    color: "leaf",
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
    color: "gold",
    speed: -0.2,
    spin: -0.05,
    dur: 8,
    delay: -1,
    rot: 140,
  },
];

const CTA_LEAVES: LeafSpec[] = [
  {
    x: "62%",
    y: "14%",
    size: 44,
    color: "leaf",
    speed: -0.1,
    spin: 0.05,
    dur: 8,
    delay: 0,
    rot: 30,
  },
  {
    x: "80%",
    y: "58%",
    size: 56,
    color: "gold",
    speed: 0.12,
    spin: -0.04,
    dur: 9,
    delay: -3,
    rot: -40,
  },
  {
    x: "68%",
    y: "82%",
    size: 32,
    color: "emerald",
    speed: -0.16,
    spin: 0.06,
    dur: 7,
    delay: -2,
    rot: 120,
  },
];

function Arrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="grain relative overflow-hidden">
          <LeafLayer leaves={HERO_LEAVES} />
          <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:py-20 lg:grid-cols-[1.05fr_1fr]">
            <div className="flex flex-col gap-7">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-forest/25 bg-cream-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-forest">
                <span className="h-2 w-2 rounded-full bg-emerald" />
                Bilan carbone associatif
              </span>
              <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-night [text-wrap:balance] sm:text-6xl lg:text-7xl">
                Mesure l&apos;
                <span className="relative whitespace-nowrap text-forest">
                  impact
                  <span className="absolute -bottom-1 left-0 -z-10 h-3 w-full -skew-x-12 rounded-sm bg-leaf/70" />
                </span>{" "}
                de ton association
              </h1>
              <p className="max-w-[52ch] text-lg leading-relaxed text-ink/80">
                Choisis les postes qui te concernent, renseigne tes quantités et obtiens ton total
                en kgCO2e, avec le détail par catégorie.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/bilan"
                  className="group flex items-center gap-2 rounded-full bg-forest px-7 py-3.5 font-semibold text-cream shadow-[0_10px_24px_-10px_rgb(7_80_74/0.7)] transition-transform hover:-translate-y-0.5"
                >
                  Calculer mon bilan
                  <span className="transition-transform group-hover:translate-x-1">
                    <Arrow />
                  </span>
                </Link>
                <Link
                  href="/event"
                  className="rounded-full border-2 border-night px-7 py-3.5 font-semibold text-night transition-colors hover:bg-night hover:text-cream"
                >
                  Voir les événements
                </Link>
              </div>
              <ul className="flex flex-wrap gap-x-8 gap-y-3 pt-2 text-sm font-medium text-ink/75">
                {HIGHLIGHTS.map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rotate-45 rounded-[3px] bg-gold" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <GlobeScene />
          </div>
        </section>

        {/* Cartes */}
        <div className="relative overflow-hidden">
          <LeafLayer leaves={CARDS_LEAVES} />
          <section className="relative z-10 mx-auto max-w-6xl px-5 py-16 md:py-24">
            <div className="mb-12 flex flex-col gap-4 md:max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald">
                Ce que tu peux faire
              </span>
              <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-night [text-wrap:balance] md:text-5xl">
                Suivre, agir et retrouver l&apos;équipe
              </h2>
              <p className="text-lg leading-relaxed text-ink/75">
                Un outil simple pour les associations qui veulent mesurer leur empreinte carbone et
                faire vivre leur mandat.
              </p>
            </div>
            <div className="tilt-wrap grid gap-6 md:grid-cols-3">
              {CARDS.map((c) => (
                <Link
                  key={c.title}
                  href={c.href}
                  className="tilt-card group flex flex-col gap-5 rounded-3xl border border-ink/10 bg-cream-soft p-4"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-black">
                    <span className={`absolute left-3 top-3 h-3 w-12 rounded-full ${c.tone}`} />
                  </div>
                  <div className="flex flex-col gap-2 px-2 pb-2">
                    <h3 className="font-display text-2xl font-bold text-night">{c.title}</h3>
                    <p className="leading-relaxed text-ink/75">{c.text}</p>
                    <span className="mt-2 inline-flex items-center gap-2 font-semibold text-blue">
                      {c.cta}
                      <span className="transition-transform group-hover:translate-x-1">
                        <Arrow />
                      </span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Bandeau vert */}
        <section className="relative overflow-hidden bg-forest text-cream">
          <LeafLayer leaves={BAND_LEAVES} />
          <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-14 px-5 py-16 md:py-24 lg:grid-cols-2">
            <div className="grid grid-cols-2 gap-4" style={{ perspective: "1000px" }}>
              <div className="float-block aspect-[3/4] rounded-2xl bg-black" />
              <div className="float-block mt-10 aspect-[3/4] rounded-2xl bg-black" />
              <div className="float-block -mt-6 aspect-square rounded-2xl bg-black" />
              <div className="float-block mt-4 aspect-square rounded-2xl border-2 border-leaf bg-black" />
            </div>
            <div className="flex flex-col gap-6">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-leaf">
                Comment ça marche
              </span>
              <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight [text-wrap:balance] md:text-5xl">
                Un bilan, étape par étape
              </h2>
              <p className="max-w-[52ch] text-lg leading-relaxed text-cream/85">
                Pas besoin d&apos;être expert : le site s&apos;occupe des calculs avec les facteurs
                d&apos;émission officiels.
              </p>
              <ol className="flex flex-col gap-4">
                {STEPS.map((step, i) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-leaf text-sm font-bold text-ink">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
              <Link
                href="/bilan"
                className="mt-2 flex w-fit items-center gap-2 rounded-full bg-leaf px-7 py-3.5 font-semibold text-ink transition-transform hover:-translate-y-0.5"
              >
                Commencer mon bilan
                <Arrow />
              </Link>
            </div>
          </div>
        </section>

        {/* Appel à l'action */}
        <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          <div className="relative overflow-hidden rounded-[2rem] bg-night px-7 py-14 text-cream md:px-16 md:py-20">
            <span className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[28px] border-blue/60" />
            <span className="absolute -bottom-32 right-24 h-64 w-64 rounded-full border-[24px] border-emerald/50" />
            <LeafLayer leaves={CTA_LEAVES} />
            <div className="relative z-10 flex max-w-2xl flex-col gap-6">
              <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight [text-wrap:balance] md:text-5xl">
                Prêt à mesurer ton empreinte ?
              </h2>
              <p className="text-lg leading-relaxed text-cream/85">
                Connecte-toi avec Discord pour retrouver automatiquement tous tes bilans dans ton
                historique.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/connexion"
                  className="rounded-full bg-gold px-7 py-3.5 font-semibold text-ink transition-transform hover:-translate-y-0.5"
                >
                  Connexion
                </Link>
                <Link
                  href="/bilan"
                  className="rounded-full border-2 border-cream/60 px-7 py-3.5 font-semibold transition-colors hover:bg-cream hover:text-night"
                >
                  Mon bilan
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-ink/70">
          <span className="flex items-center gap-3">
            <Image src="/logo.svg" alt="" width={32} height={32} />
            Harmony · Bilan carbone pour les associations
          </span>
          <span>Facteurs d&apos;émission : Impact CO2 (ADEME)</span>
        </div>
      </footer>
    </>
  );
}
