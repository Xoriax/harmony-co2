import LeafLayer from "./leaf-layer";
import { sideLeaves } from "./leaf-presets";

// <main> avec des feuilles décoratives derrière le contenu. Pas d'overflow sur <main> :
// il casserait les éléments sticky (le calque se contient lui-même).
export function LeafPage({
  children,
  seed,
}: {
  children: React.ReactNode;
  /** Nom de la page : il détermine la disposition et les tailles des feuilles. */
  seed: string;
}) {
  return (
    <main className="relative flex-1">
      <LeafLayer leaves={sideLeaves(seed)} />
      <div className="relative z-10">{children}</div>
    </main>
  );
}
