import type { Metadata } from "next";
import Link from "next/link";
import { GlobeScene } from "./globe-scene";
import { LeafPage } from "./leaf-page";
import { SiteHeader } from "./site-header";

export const metadata: Metadata = { title: "Page introuvable" };

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <LeafPage>
        <section className="grain overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
            <div className="flex flex-col gap-6">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-forest/25 bg-cream-soft px-4 py-1.5 text-xs font-semibold tracking-[0.14em] text-forest uppercase">
                <span className="h-2 w-2 rounded-full bg-gold" />
                Erreur 404
              </span>
              <h1 className="font-display text-5xl leading-[1.02] font-extrabold tracking-tight text-balance text-night sm:text-6xl">
                Cette page a pris la{" "}
                <span className="relative whitespace-nowrap text-forest">
                  tangente
                  <span className="absolute -bottom-1 left-0 -z-10 h-3 w-full -skew-x-12 rounded-sm bg-leaf/70" />
                </span>
              </h1>
              <p className="max-w-[48ch] text-lg leading-relaxed text-ink/80">
                Le lien est peut-être ancien, ou l&apos;adresse mal tapée. Reviens à l&apos;accueil
                ou choisis une des pages ci-dessous.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="rounded-full bg-forest px-7 py-3.5 font-semibold text-cream shadow-[0_10px_24px_-10px_rgb(7_80_74/0.7)] transition-transform hover:-translate-y-0.5"
                >
                  Retour à l&apos;accueil
                </Link>
                <Link
                  href="/bilan"
                  className="rounded-full border-2 border-night px-7 py-3.5 font-semibold text-night transition-colors hover:bg-night hover:text-cream"
                >
                  Calculer un bilan
                </Link>
                <Link
                  href="/event"
                  className="rounded-full border-2 border-night px-7 py-3.5 font-semibold text-night transition-colors hover:bg-night hover:text-cream"
                >
                  Événements
                </Link>
              </div>
            </div>
            <div className="hidden w-full max-w-[300px] justify-self-center md:block">
              <GlobeScene small />
            </div>
          </div>
        </section>
      </LeafPage>
    </>
  );
}
