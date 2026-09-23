import { describe, expect, it } from "vitest";
import { parisMonthKey, parisToDate, parisYear } from "@/lib/paris-time";

const iso = (local: string) => parisToDate(local).toISOString();

describe("parisToDate", () => {
  it("convertit l'heure d'été (UTC+2)", () => {
    expect(iso("2026-07-15T20:00:00")).toBe("2026-07-15T18:00:00.000Z");
  });

  it("convertit l'heure d'hiver (UTC+1) et accepte l'absence de secondes", () => {
    expect(iso("2026-12-15T20:00")).toBe("2026-12-15T19:00:00.000Z");
  });

  it("conserve les secondes", () => {
    expect(iso("2026-07-15T20:00:45")).toBe("2026-07-15T18:00:45.000Z");
  });

  it("passe à l'heure d'été le dernier dimanche de mars (29 mars 2026)", () => {
    expect(iso("2026-03-29T01:59:00")).toBe("2026-03-29T00:59:00.000Z"); // encore UTC+1
    expect(iso("2026-03-29T03:00:00")).toBe("2026-03-29T01:00:00.000Z"); // déjà UTC+2
  });

  it("ne plante pas sur l'heure qui n'existe pas (02:30 le 29 mars)", () => {
    const utc = iso("2026-03-29T02:30:00");
    expect(["2026-03-29T00:30:00.000Z", "2026-03-29T01:30:00.000Z"]).toContain(utc);
  });

  it("repasse à l'heure d'hiver le dernier dimanche d'octobre (25 octobre 2026)", () => {
    expect(iso("2026-10-25T01:59:00")).toBe("2026-10-24T23:59:00.000Z"); // encore UTC+2
    expect(iso("2026-10-25T03:00:00")).toBe("2026-10-25T02:00:00.000Z"); // déjà UTC+1
  });

  it("choisit l'une des deux heures possibles quand 02:30 existe deux fois", () => {
    const utc = iso("2026-10-25T02:30:00");
    expect(["2026-10-25T00:30:00.000Z", "2026-10-25T01:30:00.000Z"]).toContain(utc);
  });

  it("gère le passage d'une année à l'autre", () => {
    expect(iso("2026-12-31T23:30:00")).toBe("2026-12-31T22:30:00.000Z");
    expect(iso("2027-01-01T00:00:00")).toBe("2026-12-31T23:00:00.000Z");
  });

  it("ne dépend pas du fuseau de la machine", () => {
    expect(process.env.TZ).toBe("Pacific/Auckland");
    expect(iso("2026-07-15T12:00:00")).toBe("2026-07-15T10:00:00.000Z");
  });
});

describe("parisYear", () => {
  it("lit l'année à Paris, pas celle de la machine", () => {
    // La machine des tests est en Pacific/Auckland (en avance) : au réveillon, minuit à Auckland
    // est encore la veille à Paris.
    expect(parisYear(new Date("2027-01-01T00:30:00+13:00"))).toBe(2026);
  });

  it("passe à l'année suivante une fois minuit passé à Paris", () => {
    expect(parisYear(new Date("2026-12-31T23:30:00Z"))).toBe(2027);
  });
});

describe("parisMonthKey", () => {
  it("donne le mois au format AAAA-MM, à Paris", () => {
    expect(parisMonthKey(new Date("2026-07-15T10:00:00Z"))).toBe("2026-07");
  });

  it("bascule au mois suivant après minuit à Paris, pas à la machine", () => {
    // 23:30 UTC le 30 juin = 01:30 le 1er juillet à Paris (heure d'été, UTC+2).
    expect(parisMonthKey(new Date("2026-06-30T23:30:00Z"))).toBe("2026-07");
  });
});
