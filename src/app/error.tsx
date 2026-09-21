"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

// Erreur inattendue sur une page : le reste du site continue de fonctionner, l'utilisateur peut réessayer.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <header className="border-b border-ink/10 bg-cream/85">
        <div className="mx-auto flex max-w-6xl items-center px-5 py-3">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.svg" alt="" width={44} height={44} />
            <span className="font-display text-xl font-bold tracking-tight text-night">
              Harmony
            </span>
          </Link>
        </div>
      </header>

      <main className="grain flex flex-1 items-center justify-center px-5 py-20">
        <div className="flex w-full max-w-xl flex-col gap-6 rounded-3xl border border-ink/10 bg-cream-soft p-8 shadow-[0_30px_50px_-32px_rgb(20_37_54/0.5)]">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-red-800/25 bg-red-50 px-4 py-1.5 text-xs font-semibold tracking-[0.14em] text-red-800 uppercase">
            <span className="h-2 w-2 rounded-full bg-red-700" />
            Erreur
          </span>
          <div className="flex flex-col gap-3">
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-night">
              Quelque chose s&apos;est mal passé
            </h1>
            <p className="leading-relaxed text-ink/80">
              La page n&apos;a pas pu s&apos;afficher. Tu peux réessayer, ou revenir à
              l&apos;accueil si le problème persiste.
            </p>
            {error.digest && (
              <p className="text-sm text-ink/60">
                Référence à communiquer si besoin : <code>{error.digest}</code>
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-full bg-forest px-7 py-3.5 font-semibold text-cream transition-transform hover:-translate-y-0.5"
            >
              Réessayer
            </button>
            <Link
              href="/"
              className="rounded-full border-2 border-night px-7 py-3.5 font-semibold text-night transition-colors hover:bg-night hover:text-cream"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
