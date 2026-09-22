import "server-only";
import { MISSING_BILANS_TABLE, type BilanRow } from "./bilans";
import { supabaseAdmin } from "./supabase";

export type BilanStats = {
  count: number;
  totalEmissions: number;
  averageTotal: number;
  topCategories: { name: string; subtotal: number; count: number }[];
};

type StatsInput = Pick<BilanRow, "total" | "categories">;

// Agrège les statistiques à partir des bilans enregistrés (nombre, total cumulé, moyenne et
// catégories les plus utilisées, triées par émissions cumulées). Fonction pure, testée seule.
export function computeBilanStats(rows: StatsInput[]): BilanStats {
  const count = rows.length;
  const totalEmissions = rows.reduce((sum, row) => sum + row.total, 0);
  const averageTotal = count > 0 ? totalEmissions / count : 0;

  const byCategory = new Map<string, { subtotal: number; count: number }>();
  for (const row of rows) {
    for (const category of row.categories) {
      const current = byCategory.get(category.name) ?? { subtotal: 0, count: 0 };
      current.subtotal += category.subtotal;
      current.count += category.count;
      byCategory.set(category.name, current);
    }
  }

  const topCategories = [...byCategory.entries()]
    .map(([name, totals]) => ({ name, ...totals }))
    .sort((a, b) => b.subtotal - a.subtotal);

  return { count, totalEmissions, averageTotal, topCategories };
}

// Réservé au backoffice : contrairement aux autres listes (events, mandat), il n'y a pas besoin
// de cache ici, les statistiques n'étant consultées que par les administrateurs.
export async function getBilanStats() {
  const { data, error } = await supabaseAdmin()
    .from("bilans")
    .select("total,categories")
    .limit(5000);

  if (error) {
    return {
      stats: computeBilanStats([]),
      error:
        error.code === "PGRST205"
          ? MISSING_BILANS_TABLE
          : "Impossible de charger les statistiques.",
    };
  }
  return { stats: computeBilanStats(data as StatsInput[]), error: null };
}
