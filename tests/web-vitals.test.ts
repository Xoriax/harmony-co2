import { describe, expect, it } from "vitest";
import { parseVitalsMetric } from "@/lib/web-vitals";

const valid = { name: "LCP", value: 1234.5, rating: "good", path: "/bilan" };

describe("parseVitalsMetric", () => {
  it("accepte une mesure valide", () => {
    expect(parseVitalsMetric(valid)).toEqual(valid);
  });

  it("refuse un nom de métrique inconnu", () => {
    expect(parseVitalsMetric({ ...valid, name: "XYZ" })).toBeNull();
  });

  it("refuse une valeur non numérique, négative ou infinie", () => {
    expect(parseVitalsMetric({ ...valid, value: "1234" })).toBeNull();
    expect(parseVitalsMetric({ ...valid, value: -1 })).toBeNull();
    expect(parseVitalsMetric({ ...valid, value: Infinity })).toBeNull();
  });

  it("refuse un verdict inconnu", () => {
    expect(parseVitalsMetric({ ...valid, rating: "excellent" })).toBeNull();
  });

  it("refuse un chemin manquant ou vide", () => {
    expect(parseVitalsMetric({ ...valid, path: "" })).toBeNull();
    const { path: _path, ...withoutPath } = valid;
    void _path;
    expect(parseVitalsMetric(withoutPath)).toBeNull();
  });

  it("tronque un chemin trop long plutôt que de le refuser", () => {
    const long = "/" + "a".repeat(500);
    expect(parseVitalsMetric({ ...valid, path: long })?.path.length).toBe(200);
  });

  it("refuse un corps qui n'est pas un objet", () => {
    expect(parseVitalsMetric(null)).toBeNull();
    expect(parseVitalsMetric("LCP")).toBeNull();
    expect(parseVitalsMetric(42)).toBeNull();
  });
});
