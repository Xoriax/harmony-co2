import LeafLayer from "./leaf-layer";
import { SIDE_LEAVES } from "./leaf-presets";

// <main> avec des feuilles décoratives derrière le contenu. Pas d'overflow sur <main> :
// il casserait les éléments sticky (le calque se contient lui-même).
export function LeafPage({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex-1">
      <LeafLayer leaves={SIDE_LEAVES} />
      <div className="relative z-10">{children}</div>
    </main>
  );
}
