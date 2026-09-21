import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/85 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Logo Harmony" width={44} height={44} priority />
          <span className="font-display text-xl font-bold tracking-tight text-night">
            Harmony
          </span>
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link href="/bilan" className="hover:text-blue">Mon bilan</Link>
          <Link href="/event" className="hover:text-blue">Event</Link>
          <Link href="/mandat" className="hover:text-blue">Mandat</Link>
        </div>
        <Link
          href="/connexion"
          className="rounded-full bg-night px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-blue"
        >
          Connexion
        </Link>
      </nav>
    </header>
  );
}
