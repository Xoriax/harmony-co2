"use client";

import { useRef } from "react";

// Carte 3D : elle s'incline vers la souris et les enfants marqués .depth-* ressortent en profondeur.
// Le contenu (server components) est passé en children : rien de plus n'est envoyé au navigateur.
export default function TiltCard({
  children,
  className = "",
  strength = 1,
  glare = true,
}: {
  children: React.ReactNode;
  className?: string;
  /** Amplitude de l'inclinaison (1 = carte étroite, moins pour une carte large). */
  strength?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${(x - 0.5) * 16 * strength}deg`);
    el.style.setProperty("--rx", `${(0.5 - y) * 14 * strength}deg`);
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    for (const v of ["--rx", "--ry", "--mx", "--my"]) el.style.removeProperty(v);
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`tilt3d ${className}`}
    >
      {children}
      {glare && <span aria-hidden="true" className="tilt-glare" />}
    </div>
  );
}
