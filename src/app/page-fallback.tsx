import { SiteHeader } from "./site-header";

// Affiché instantanément (il fait partie de la coquille statique) pendant que la partie liée à la session arrive.
export function PageFallback() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-5 py-24">
        <p role="status" className="flex items-center gap-3 font-medium text-ink/70">
          <span className="h-3 w-3 animate-pulse rounded-full bg-emerald" />
          Chargement…
        </p>
      </main>
    </>
  );
}
