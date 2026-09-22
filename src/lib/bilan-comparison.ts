export type BilanComparison = {
  previousAverage: number | null;
  previousDeltaPct: number | null; // + : au-dessus de la moyenne des bilans précédents
  goalTotal: number | null;
  goalLabel: string | null;
  goalDeltaPct: number | null; // + : au-dessus de l'objectif
};

// Compare le total d'un bilan à la moyenne des bilans précédents de l'utilisateur et/ou à
// l'objectif défini dans le backoffice. Fonction pure, testée seule ; `previousTotals` ne doit
// pas inclure le bilan en cours. Renvoie null quand il n'y a rien à comparer.
export function buildComparison(
  total: number,
  previousTotals: number[],
  goal: { total: number | null; label: string | null },
): BilanComparison | null {
  if (previousTotals.length === 0 && goal.total === null) return null;

  const previousAverage =
    previousTotals.length > 0
      ? previousTotals.reduce((sum, t) => sum + t, 0) / previousTotals.length
      : null;

  const pct = (base: number | null) =>
    base !== null && base > 0 ? ((total - base) / base) * 100 : null;

  return {
    previousAverage,
    previousDeltaPct: pct(previousAverage),
    goalTotal: goal.total,
    goalLabel: goal.label,
    goalDeltaPct: pct(goal.total),
  };
}
