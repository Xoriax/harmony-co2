"use client";

import { useRef } from "react";

const RINGS = Array.from({ length: 6 }, (_, i) => i);

const LEAVES = [
  { top: "6%", left: "8%", bg: "var(--leaf)", delay: "0s" },
  { top: "18%", left: "82%", bg: "var(--emerald)", delay: "-1.5s" },
  { top: "74%", left: "4%", bg: "var(--gold)", delay: "-3s" },
  { top: "84%", left: "78%", bg: "var(--leaf)", delay: "-4.5s" },
];

export function GlobeScene({ small = false }: { small?: boolean }) {
  const tilt = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = tilt.current;
    if (!el) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${x * 28}deg`);
    el.style.setProperty("--rx", `${-y * 22}deg`);
  }

  function onLeave() {
    const el = tilt.current;
    if (!el) return;
    el.style.removeProperty("--ry");
    el.style.removeProperty("--rx");
  }

  return (
    <div
      className={`scene relative mx-auto aspect-square w-full ${
        small ? "scene-sm max-w-[240px]" : "max-w-[460px]"
      }`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-hidden="true"
    >
      <div ref={tilt} className="scene-tilt absolute inset-[8%]">
        <div className="globe">
          {RINGS.map((i) => (
            <span
              key={i}
              className="ring"
              style={{ "--i": i } as React.CSSProperties}
            />
          ))}
          <span className="equator" />
          <span className="equator tropic" />
          <span className="equator tropic top" />
          <span className="core" />
        </div>
      </div>
      {LEAVES.map((l, i) => (
        <span
          key={i}
          className="leaf"
          style={{
            top: l.top,
            left: l.left,
            background: l.bg,
            animationDelay: l.delay,
          }}
        />
      ))}
      <span className="shadow-disc" />
    </div>
  );
}
