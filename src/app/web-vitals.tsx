"use client";

import { useReportWebVitals } from "next/web-vitals";

// Mesure anonyme de la performance du site, envoyée à /api/vitals : aucun cookie, aucun
// identifiant de visiteur, aucun service tiers (voir /confidentialite). Sert uniquement à suivre
// la vitesse de chargement en production, en complément de `npm run size` qui ne mesure qu'en local.
export function WebVitals() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV !== "production") return;

    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      path: location.pathname,
    });

    // sendBeacon survit à la fermeture de l'onglet, ce qui arrive souvent juste après ces
    // métriques (LCP, CLS) ; fetch keepalive en repli pour les navigateurs qui ne l'ont pas.
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/vitals", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/vitals", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  });

  return null;
}
