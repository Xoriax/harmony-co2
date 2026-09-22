import { describe, expect, it } from "vitest";
import { buildComparison } from "@/lib/bilan-comparison";

describe("buildComparison", () => {
  it("renvoie null sans historique ni objectif", () => {
    expect(buildComparison(100, [], { total: null, label: null })).toBeNull();
  });

  it("calcule la moyenne et l'écart aux bilans précédents", () => {
    const c = buildComparison(120, [80, 100], { total: null, label: null });
    expect(c?.previousAverage).toBe(90);
    expect(c?.previousDeltaPct).toBeCloseTo(33.33, 1);
  });

  it("calcule l'écart à l'objectif", () => {
    const c = buildComparison(120, [], { total: 100, label: "Objectif 2026" });
    expect(c?.goalTotal).toBe(100);
    expect(c?.goalLabel).toBe("Objectif 2026");
    expect(c?.goalDeltaPct).toBeCloseTo(20, 5);
  });

  it("un total sous la moyenne et sous l'objectif donne un écart négatif", () => {
    const c = buildComparison(50, [100], { total: 80, label: null });
    expect(c?.previousDeltaPct).toBeCloseTo(-50, 5);
    expect(c?.goalDeltaPct).toBeCloseTo(-37.5, 5);
  });

  it("n'échoue pas sur un objectif à zéro (division évitée)", () => {
    const c = buildComparison(10, [], { total: 0, label: null });
    expect(c?.goalDeltaPct).toBeNull();
  });
});
