import Image from "next/image";
import Link from "next/link";
import { GlobeScene } from "./globe-scene";
import { SiteHeader } from "./site-header";

const CARDS = [
  { href: "/bilan", tone: "bg-leaf", title: "Lorem ipsum dolor" },
  { href: "/event", tone: "bg-sky", title: "Consectetur elit" },
  { href: "/connexion", tone: "bg-gold", title: "Sed do eiusmod" },
];

const POINTS = [
  "Lorem ipsum dolor sit amet consectetur",
  "Adipiscing elit sed do eiusmod tempor",
  "Incididunt ut labore et dolore magna",
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
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:py-20 lg:grid-cols-[1.05fr_1fr]">
            <div className="flex flex-col gap-7">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-forest/25 bg-cream-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-forest">
                <span className="h-2 w-2 rounded-full bg-emerald" />
                Lorem ipsum
              </span>
              <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-night [text-wrap:balance] sm:text-6xl lg:text-7xl">
                Lorem ipsum{" "}
                <span className="relative whitespace-nowrap text-forest">
                  dolor
                  <span className="absolute -bottom-1 left-0 h-3 w-full -skew-x-12 rounded-sm bg-leaf/70 -z-10" />
                </span>{" "}
                sit amet
              </h1>
              <p className="max-w-[52ch] text-lg leading-relaxed text-ink/80">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/bilan"
                  className="group flex items-center gap-2 rounded-full bg-forest px-7 py-3.5 font-semibold text-cream shadow-[0_10px_24px_-10px_rgb(7_80_74/0.7)] transition-transform hover:-translate-y-0.5"
                >
                  Lorem ipsum
                  <span className="transition-transform group-hover:translate-x-1">
                    <Arrow />
                  </span>
                </Link>
                <Link
                  href="/event"
                  className="rounded-full border-2 border-night px-7 py-3.5 font-semibold text-night transition-colors hover:bg-night hover:text-cream"
                >
                  Dolor sit
                </Link>
              </div>
              <ul className="flex flex-wrap gap-x-8 gap-y-3 pt-2 text-sm font-medium text-ink/75">
                {["Lorem ipsum", "Dolor sit", "Amet elit"].map((t) => (
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
        <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          <div className="mb-12 flex flex-col gap-4 md:max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald">
              Lorem ipsum
            </span>
            <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-night [text-wrap:balance] md:text-5xl">
              Lorem ipsum dolor sit amet consectetur
            </h2>
            <p className="text-lg leading-relaxed text-ink/75">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore.
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
                  <span
                    className={`absolute left-3 top-3 h-3 w-12 rounded-full ${c.tone}`}
                  />
                </div>
                <div className="flex flex-col gap-2 px-2 pb-2">
                  <h3 className="font-display text-2xl font-bold text-night">
                    {c.title}
                  </h3>
                  <p className="leading-relaxed text-ink/75">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit sed
                    do eiusmod tempor.
                  </p>
                  <span className="mt-2 inline-flex items-center gap-2 font-semibold text-blue">
                    Lorem ipsum
                    <span className="transition-transform group-hover:translate-x-1">
                      <Arrow />
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Bandeau vert */}
        <section className="bg-forest text-cream">
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-16 md:py-24 lg:grid-cols-2">
            <div
              className="grid grid-cols-2 gap-4"
              style={{ perspective: "1000px" }}
            >
              <div className="float-block aspect-[3/4] rounded-2xl bg-black" />
              <div className="float-block mt-10 aspect-[3/4] rounded-2xl bg-black" />
              <div className="float-block -mt-6 aspect-square rounded-2xl bg-black" />
              <div className="float-block mt-4 aspect-square rounded-2xl border-2 border-leaf bg-black" />
            </div>
            <div className="flex flex-col gap-6">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-leaf">
                Lorem ipsum
              </span>
              <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight [text-wrap:balance] md:text-5xl">
                Dolor sit amet consectetur adipiscing
              </h2>
              <p className="max-w-[52ch] text-lg leading-relaxed text-cream/85">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <ul className="flex flex-col gap-4">
                {POINTS.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <span className="mt-1.5 h-3 w-3 shrink-0 rounded-[0_100%_0_100%] bg-leaf" />
                    <span className="leading-relaxed">{p}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/event"
                className="mt-2 flex w-fit items-center gap-2 rounded-full bg-leaf px-7 py-3.5 font-semibold text-ink transition-transform hover:-translate-y-0.5"
              >
                Lorem ipsum
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
            <div className="relative flex max-w-2xl flex-col gap-6">
              <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight [text-wrap:balance] md:text-5xl">
                Lorem ipsum dolor sit amet
              </h2>
              <p className="text-lg leading-relaxed text-cream/85">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/connexion"
                  className="rounded-full bg-gold px-7 py-3.5 font-semibold text-ink transition-transform hover:-translate-y-0.5"
                >
                  Lorem ipsum
                </Link>
                <Link
                  href="/bilan"
                  className="rounded-full border-2 border-cream/60 px-7 py-3.5 font-semibold transition-colors hover:bg-cream hover:text-night"
                >
                  Dolor sit
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
            Lorem ipsum dolor sit amet
          </span>
          <span>Consectetur adipiscing elit</span>
        </div>
      </footer>
    </>
  );
}
