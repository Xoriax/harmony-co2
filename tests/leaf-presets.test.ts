import { describe, expect, it } from "vitest";
import { sideLeaves } from "@/app/leaf-presets";

describe("sideLeaves", () => {
  it("donne toujours les mêmes feuilles pour une même page (pas d'écart d'hydratation)", () => {
    expect(sideLeaves("bilan")).toEqual(sideLeaves("bilan"));
  });

  it("donne une disposition et des tailles différentes d'une page à l'autre", () => {
    const sizes = (seed: string) => sideLeaves(seed).map((leaf) => leaf.size);
    expect(sizes("bilan")).not.toEqual(sizes("event"));
    expect(sizes("event")).not.toEqual(sizes("mandat"));
  });

  it("en met assez, mais pas trop, avec des tailles variées", () => {
    const leaves = sideLeaves("historique");
    expect(leaves.length).toBeGreaterThanOrEqual(12);
    expect(leaves.length).toBeLessThanOrEqual(20);
    const sizes = leaves.map((leaf) => leaf.size);
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(22);
    expect(Math.max(...sizes)).toBeLessThanOrEqual(78);
    expect(new Set(sizes).size).toBeGreaterThan(6);
  });

  it("garde des feuilles visibles sur mobile", () => {
    const visible = sideLeaves("event").filter((leaf) => !leaf.hideOnMobile);
    expect(visible.length).toBeGreaterThanOrEqual(6);
  });
});
