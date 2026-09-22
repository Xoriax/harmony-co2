import { afterEach, describe, expect, it, vi } from "vitest";
import {
  eventDay,
  eventEnd,
  eventStatus,
  formatCountdown,
  formatShortDate,
  formatTime,
  matchesEventSearch,
  nowParis,
  nowParisFull,
  remainingMs,
  toInputValue,
  type EventRow,
} from "@/lib/event-format";

const event = (starts_at: string, ends_at: string | null): EventRow => ({
  id: "1",
  title: "Atelier",
  description: "",
  location: "",
  starts_at,
  ends_at,
  published: true,
  cover_url: null,
});

// Début le 21/09 à 18:00, fin le 22/09 à 20:30 (heures de Paris).
const multiDay = event("2026-09-21T18:00:00", "2026-09-22T20:30:00");

afterEach(() => {
  vi.useRealTimers();
});

describe("heure de Paris", () => {
  it("donne l'heure d'été de Paris quelle que soit la machine", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-15T18:00:05Z"));
    expect(nowParisFull()).toBe("2026-07-15T20:00:05");
    expect(nowParis()).toBe("2026-07-15T20:00");
  });

  it("donne l'heure d'hiver de Paris", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-12-15T18:00:05Z"));
    expect(nowParisFull()).toBe("2026-12-15T19:00:05");
  });

  it("passe au jour suivant à minuit heure de Paris", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-15T22:00:00Z")); // 00:00 le 16 à Paris
    expect(nowParisFull()).toBe("2026-07-16T00:00:00");
  });
});

describe("eventStatus", () => {
  it("est « à venir » avant le début", () => {
    expect(eventStatus(multiDay, "2026-09-21T17:59:59")).toBe("upcoming");
  });

  it("est « en cours » dès le début (inclus)", () => {
    expect(eventStatus(multiDay, "2026-09-21T18:00:00")).toBe("live");
  });

  it("reste « en cours » jusqu'à la dernière seconde", () => {
    expect(eventStatus(multiDay, "2026-09-22T20:29:59")).toBe("live");
  });

  it("est « terminé » à l'heure de fin exacte (exclue)", () => {
    expect(eventStatus(multiDay, "2026-09-22T20:30:00")).toBe("ended");
    expect(eventStatus(multiDay, "2026-09-23T08:00:00")).toBe("ended");
  });

  it("accepte une heure courante sans secondes", () => {
    expect(eventStatus(multiDay, "2026-09-22T20:30")).toBe("ended");
    expect(eventStatus(multiDay, "2026-09-21T18:00")).toBe("live");
  });

  it("sans fin (anciennes données), dure jusqu'à la fin de la journée de début", () => {
    const legacy = event("2026-09-21T18:00:00", null);
    expect(eventEnd(legacy)).toBe("2026-09-21T23:59:59");
    expect(eventStatus(legacy, "2026-09-21T23:59:58")).toBe("live");
    expect(eventStatus(legacy, "2026-09-22T00:00:00")).toBe("ended");
  });

  it("accepte des dates stockées avec des millisecondes", () => {
    const withMs = event("2026-09-21T18:00:00.000", "2026-09-21T20:00:00.000");
    expect(eventStatus(withMs, "2026-09-21T19:00:00")).toBe("live");
  });
});

describe("compte à rebours", () => {
  it("calcule le temps restant jusqu'à la fin", () => {
    expect(remainingMs(multiDay, "2026-09-22T20:29:00")).toBe(60_000);
    expect(remainingMs(multiDay, "2026-09-21T18:00:00")).toBe(26 * 3600_000 + 30 * 60_000);
  });

  it("devient négatif après la fin", () => {
    expect(remainingMs(multiDay, "2026-09-22T20:30:10")).toBe(-10_000);
  });

  it("formate jours, heures, minutes et secondes", () => {
    expect(formatCountdown((26 * 3600 + 30 * 60 + 1) * 1000)).toBe("1 j 02 h 30 min 01 s");
  });

  it("n'affiche pas les jours quand il n'y en a plus", () => {
    expect(formatCountdown((3 * 3600 + 5 * 60 + 9) * 1000)).toBe("03 h 05 min 09 s");
  });

  it("ne descend jamais sous zéro", () => {
    expect(formatCountdown(-5000)).toBe("00 h 00 min 00 s");
    expect(formatCountdown(0)).toBe("00 h 00 min 00 s");
  });
});

describe("formats d'affichage", () => {
  it("extrait l'heure et le jour sans décalage de fuseau", () => {
    expect(formatTime("2026-09-21T18:05:00")).toBe("18:05");
    expect(eventDay("2026-09-21T18:05:00")).toMatchObject({ day: "21", time: "18:05" });
  });

  it("formate la date en français", () => {
    const text = formatShortDate("2026-09-21T18:05:00");
    expect(text).toContain("21");
    expect(text).toContain("2026");
  });

  it("prépare la valeur d'un champ datetime-local", () => {
    expect(toInputValue("2026-09-21T18:00:00")).toBe("2026-09-21T18:00");
    expect(toInputValue(null)).toBe("");
  });
});

describe("matchesEventSearch", () => {
  const workshop: EventRow = { ...multiDay, title: "Atelier compost", location: "Jardin partagé" };

  it("accepte tout sans recherche", () => {
    expect(matchesEventSearch(workshop, "")).toBe(true);
    expect(matchesEventSearch(workshop, "   ")).toBe(true);
  });

  it("cherche dans le titre, insensible à la casse", () => {
    expect(matchesEventSearch(workshop, "COMPOST")).toBe(true);
    expect(matchesEventSearch(workshop, "conférence")).toBe(false);
  });

  it("cherche aussi dans le lieu", () => {
    expect(matchesEventSearch(workshop, "jardin")).toBe(true);
  });
});
