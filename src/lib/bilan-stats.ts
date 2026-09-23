import "server-only";
import { MISSING_BILANS_TABLE, type BilanRow } from "./bilans";
import { parisMonthKey } from "./paris-time";
import { supabaseAdmin } from "./supabase";

export type MonthlyStat = { month: string; label: string; total: number; count: number };

// Écart entre les deux mois les plus récents parmi ceux qui ont au moins un bilan ; `null` s'il y
// en a moins de deux.
export type MonthComparison = {
  current: MonthlyStat;
  previous: MonthlyStat;
  deltaPct: number | null; // + : plus d'émissions que le mois précédent
} | null;

export type BilanStats = {
  count: number;
  totalEmissions: number;
  averageTotal: number;
  topCategories: { name: string; subtotal: number; count: number }[];
  // Un mois par entrée présente dans les données (pas de mois à zéro comblé), du plus ancien au
  // plus récent.
  monthly: MonthlyStat[];
  monthComparison: MonthComparison;
};

type StatsInput = Pick<BilanRow, "total" | "categories" | "created_at">;

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function computeMonthly(rows: StatsInput[]): MonthlyStat[] {
  const byMonth = new Map<string, { total: number; count: number }>();
  for (const row of rows) {
    const key = parisMonthKey(new Date(row.created_at));
    const current = byMonth.get(key) ?? { total: 0, count: 0 };
    current.total += row.total;
    current.count += 1;
    byMonth.set(key, current);
  }
  return [...byMonth.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, totals]) => ({ month, label: monthLabel(month), ...totals }));
}

function computeMonthComparison(monthly: MonthlyStat[]): MonthComparison {
  if (monthly.length < 2) return null;
  const [previous, current] = monthly.slice(-2);
  const deltaPct =
    previous.total > 0 ? ((current.total - previous.total) / previous.total) * 100 : null;
  return { current, previous, deltaPct };
}

// Agrège les statistiques à partir des bilans enregistrés (nombre, total cumulé, moyenne,
// catégories les plus utilisées triées par émissions cumulées, et total par mois avec le
// comparatif des deux derniers mois actifs). Fonction pure, testée seule.
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

  const monthly = computeMonthly(rows);

  return {
    count,
    totalEmissions,
    averageTotal,
    topCategories,
    monthly,
    monthComparison: computeMonthComparison(monthly),
  };
}

// Réservé au backoffice : contrairement aux autres listes (events, mandat), il n'y a pas besoin
// de cache ici, les statistiques n'étant consultées que par les administrateurs.
export async function getBilanStats() {
  const { data, error } = await supabaseAdmin()
    .from("bilans")
    .select("total,categories,created_at")
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
