import { describe, expect, it } from "vitest";
import { parseSettingsForm } from "@/lib/settings-form";

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

describe("parseSettingsForm", () => {
  it("accepte des valeurs vides : ni objectif ni alerte", () => {
    const { patch, error } = parseSettingsForm(
      formData({ goalTotal: "", goalLabel: "", alertThreshold: "" }),
    );
    expect(error).toBeNull();
    expect(patch).toEqual({ goalTotal: null, goalLabel: null, alertThreshold: null });
  });

  it("accepte une virgule décimale", () => {
    const { patch, error } = parseSettingsForm(
      formData({ goalTotal: "1234,5", goalLabel: "Objectif 2026", alertThreshold: "500" }),
    );
    expect(error).toBeNull();
    expect(patch).toEqual({ goalTotal: 1234.5, goalLabel: "Objectif 2026", alertThreshold: 500 });
  });

  it("refuse un objectif non numérique", () => {
    const { error } = parseSettingsForm(
      formData({ goalTotal: "abc", goalLabel: "", alertThreshold: "" }),
    );
    expect(error).toMatch(/objectif/i);
  });

  it("refuse un objectif négatif", () => {
    const { error } = parseSettingsForm(
      formData({ goalTotal: "-1", goalLabel: "", alertThreshold: "" }),
    );
    expect(error).toMatch(/objectif/i);
  });

  it("refuse un seuil d'alerte non numérique", () => {
    const { error } = parseSettingsForm(
      formData({ goalTotal: "", goalLabel: "", alertThreshold: "beaucoup" }),
    );
    expect(error).toMatch(/seuil/i);
  });

  it("refuse un libellé trop long", () => {
    const { error } = parseSettingsForm(
      formData({ goalTotal: "", goalLabel: "a".repeat(61), alertThreshold: "" }),
    );
    expect(error).toMatch(/libellé/i);
  });
});
