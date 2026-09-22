import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { parseVitalsMetric } from "@/lib/web-vitals";

// Reçoit les métriques de performance envoyées par WebVitals (voir ../../web-vitals.tsx).
// Aucune donnée personnelle : pas de cookie, pas d'IP ni d'identifiant stocké, juste la mesure.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const metric = parseVitalsMetric(body);
  if (!metric) return NextResponse.json({ ok: false }, { status: 400 });

  const { error } = await supabaseAdmin()
    .from("web_vitals")
    .insert({ metric: metric.name, value: metric.value, rating: metric.rating, path: metric.path });
  if (error) console.error("[web-vitals] enregistrement impossible :", error.message);

  return NextResponse.json({ ok: true });
}
