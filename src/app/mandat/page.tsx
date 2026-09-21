import Link from "next/link";

export default function MandatPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-5 py-16">
      <h1 className="font-display text-5xl font-extrabold tracking-tight text-night sm:text-6xl">
        Mandat
      </h1>
      <Link
        href="/"
        className="rounded-full border-2 border-night px-7 py-3 font-semibold text-night transition-colors hover:bg-night hover:text-cream"
      >
        Retour
      </Link>
    </main>
  );
}
