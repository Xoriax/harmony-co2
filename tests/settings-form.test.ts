import { describe, expect, it } from "vitest";
import { parseSettingsForm } from "@/lib/settings-form";

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

const EMPTY = {
  goalTotal: "",
  goalLabel: "",
  alertThreshold: "",
  auditLogRetentionDays: "",
  webVitalsRetentionDays: "",
};

describe("parseSettingsForm", () => {
  it("accepte des valeurs vides : ni objectif, ni alerte, ni conservation", () => {
    const { patch, error } = parseSettingsForm(formData(EMPTY));
    expect(error).toBeNull();
    expect(patch).toEqual({
      goalTotal: null,
      goalLabel: null,
      alertThreshold: null,
      auditLogRetentionDays: null,
      webVitalsRetentionDays: null,
    });
  });

  it("accepte une virgule décimale", () => {
    const { patch, error } = parseSettingsForm(
      formData({
        ...EMPTY,
        goalTotal: "1234,5",
        goalLabel: "Objectif 2026",
        alertThreshold: "500",
      }),
    );
    expect(error).toBeNull();
    expect(patch).toMatchObject({
      goalTotal: 1234.5,
      goalLabel: "Objectif 2026",
      alertThreshold: 500,
    });
  });

  it("accepte des durées de conservation entières positives", () => {
    const { patch, error } = parseSettingsForm(
      formData({ ...EMPTY, auditLogRetentionDays: "90", webVitalsRetentionDays: "30" }),
    );
    expect(error).toBeNull();
    expect(patch).toMatchObject({ auditLogRetentionDays: 90, webVitalsRetentionDays: 30 });
  });

  it("refuse une durée de conservation non entière", () => {
    const { error } = parseSettingsForm(formData({ ...EMPTY, auditLogRetentionDays: "1.5" }));
    expect(error).toMatch(/journal/i);
  });

  it("refuse une durée de conservation nulle ou négative", () => {
    expect(parseSettingsForm(formData({ ...EMPTY, auditLogRetentionDays: "0" })).error).toMatch(
      /journal/i,
    );
    expect(parseSettingsForm(formData({ ...EMPTY, webVitalsRetentionDays: "-5" })).error).toMatch(
      /performance/i,
    );
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
