"use client";

import { useEffect, useRef } from "react";

export type LeafSpec = {
  x: string;
  y: string;
  size: number;
  color: "leaf" | "emerald" | "gold" | "sky" | "forest";
  /** Décalage vertical par pixel de défilement (négatif = monte quand on descend). */
  speed: number;
  /** Rotation (en degrés) par pixel de défilement. */
  spin: number;
  /** Durée de la dérive automatique, en secondes. */
  dur: number;
  delay: number;
  /** Inclinaison de départ, en degrés. */
  rot: number;
  hideOnMobile?: boolean;
};

function LeafSvg({ color, size, rot }: { color: LeafSpec["color"]; size: number; rot: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{ transform: `rotate(${rot}deg)` }}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 20.5C3.5 10.5 9.5 3.5 21 3.5c0 11-6.500 17-17.500 17Z"
        fill={`var(--${color})`}
        stroke="var(--ink)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M3.5 20.5 15 9" stroke="var(--ink)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// Calque décoratif : les feuilles dérivent seules et se décalent selon la position de la section à l'écran.
export default function LeafLayer({ leaves }: { leaves: LeafSpec[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let visible = false;

    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const offset = rect.top + rect.height / 2 - window.innerHeight / 2;
      el.style.setProperty("--p", offset.toFixed(1));
    };
    const schedule = () => {
      if (visible && !frame) frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    });
    observer.observe(el);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {leaves.map((leaf, i) => (
        <span
          key={i}
          className={`leaf-parallax absolute ${leaf.hideOnMobile ? "hidden md:block" : ""}`}
          style={
            {
              left: leaf.x,
              top: leaf.y,
              "--speed": leaf.speed,
              "--spin": leaf.spin,
            } as React.CSSProperties
          }
        >
          <span
            className="leaf-drift block"
            style={{ animationDuration: `${leaf.dur}s`, animationDelay: `${leaf.delay}s` }}
          >
            <LeafSvg color={leaf.color} size={leaf.size} rot={leaf.rot} />
          </span>
        </span>
      ))}
    </div>
  );
}
