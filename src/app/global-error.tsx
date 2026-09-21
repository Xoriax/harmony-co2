"use client";

import "./globals.css";

// Dernier filet de sécurité : remplace toute la page (y compris le layout) si celui-ci plante.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body className="flex min-h-full flex-col">
        <main className="grain flex flex-1 items-center justify-center px-5 py-20">
          <div className="flex w-full max-w-xl flex-col gap-6 rounded-3xl border border-ink/10 bg-cream-soft p-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-night">
              Le site est momentanément indisponible
            </h1>
            <p className="leading-relaxed text-ink/80">
              Une erreur grave est survenue. Réessaie dans un instant.
            </p>
            {error.digest && (
              <p className="text-sm text-ink/60">
                Référence : <code>{error.digest}</code>
              </p>
            )}
            <button
              type="button"
              onClick={reset}
              className="w-fit rounded-full bg-forest px-7 py-3.5 font-semibold text-cream"
            >
              Réessayer
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
