import Image from "next/image";
import Link from "next/link";

// Pied de page commun à toutes les pages : liens légaux obligatoires et crédit des données.
export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-ink/70">
        <span className="flex items-center gap-3">
          <Image src="/logo.svg" alt="" width={32} height={32} />
          Harmony · Bilan carbone pour les associations
        </span>
        <nav aria-label="Informations légales" className="flex flex-wrap gap-x-5 gap-y-1">
          <Link href="/mentions-legales" className="hover:text-blue">
            Mentions légales
          </Link>
          <Link href="/confidentialite" className="hover:text-blue">
            Confidentialité
          </Link>
          <span>Facteurs d&apos;émission : Impact CO2 (ADEME)</span>
        </nav>
      </div>
    </footer>
  );
}
