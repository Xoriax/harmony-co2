import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "@/lib/legal";
import { LeafPage } from "../leaf-page";
import { SiteHeader } from "../site-header";

// Valeur légale : affiche « à compléter » tant que src/lib/legal.ts n'est pas renseigné.
export function Fill({ value }: { value: string | null }) {
  if (value) return <>{value}</>;
  return <mark className="rounded bg-gold/40 px-1.5 py-0.5 text-ink">à compléter</mark>;
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-2xl font-bold text-night">{title}</h2>
      {children}
    </section>
  );
}

export function List({ children }: { children: React.ReactNode }) {
  return <ul className="ml-5 flex list-disc flex-col gap-1.5 marker:text-emerald">{children}</ul>;
}

export function LegalPage({
  seed,
  title,
  intro,
  children,
}: {
  seed: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <LeafPage seed={seed}>
        <article className="mx-auto flex max-w-3xl flex-col gap-10 px-5 py-14 md:py-20">
          <header className="flex flex-col gap-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-forest/25 bg-cream-soft px-4 py-1.5 text-xs font-semibold tracking-[0.14em] text-forest uppercase">
              <span className="h-2 w-2 rounded-full bg-gold" />
              Informations légales
            </span>
            <h1 className="font-display text-4xl leading-tight font-extrabold tracking-tight text-balance text-night sm:text-5xl">
              {title}
            </h1>
            <p className="text-lg leading-relaxed text-ink/80">{intro}</p>
            <p className="text-sm text-ink/60">Dernière mise à jour : {LEGAL.updatedAt}</p>
          </header>
          <div className="flex flex-col gap-9 leading-relaxed text-ink/85">{children}</div>
          <nav className="flex flex-wrap gap-4 border-t border-ink/10 pt-6 text-sm font-semibold">
            <Link href="/mentions-legales" className="text-forest hover:text-blue">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="text-forest hover:text-blue">
              Politique de confidentialité
            </Link>
            <Link href="/" className="text-forest hover:text-blue">
              Retour à l&apos;accueil
            </Link>
          </nav>
        </article>
      </LeafPage>
    </>
  );
}

export const legalMetadata = (title: string, description: string): Metadata => ({
  title,
  description,
});
