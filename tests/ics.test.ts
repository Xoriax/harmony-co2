import { describe, expect, it } from "vitest";
import { eventsToIcsCalendar } from "@/lib/ics";
import type { EventRow } from "@/lib/event-format";

const event: EventRow = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "Collecte de vêtements",
  description: "Une après-midi pour trier et donner,\ndes vêtements.",
  location: "Local associatif",
  starts_at: "2026-10-01T14:00",
  ends_at: "2026-10-01T18:00",
  published: true,
  cover_url: null,
};

const now = new Date("2026-09-22T10:00:00Z");

describe("eventsToIcsCalendar", () => {
  it("produit un calendrier valide avec un VEVENT par événement", () => {
    const ics = eventsToIcsCalendar([event], "https://harmony.example", now);
    expect(ics).toMatch(/^BEGIN:VCALENDAR\r\n/);
    expect(ics).toContain("VERSION:2.0");
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(ics).toMatch(/END:VCALENDAR$/);
  });

  it("convertit les heures de Paris en UTC", () => {
    const ics = eventsToIcsCalendar([event], "https://harmony.example", now);
    // 1er octobre : heure d'été (UTC+2), donc 14h00 Paris = 12h00 UTC.
    expect(ics).toContain("DTSTART:20261001T120000Z");
    expect(ics).toContain("DTEND:20261001T160000Z");
  });

  it("échappe les virgules et les sauts de ligne du texte libre", () => {
    const ics = eventsToIcsCalendar([event], "https://harmony.example", now);
    expect(ics).toContain("DESCRIPTION:Une après-midi pour trier et donner\\,\\ndes vêtements.");
  });

  it("propose un lieu par défaut quand il est vide", () => {
    const ics = eventsToIcsCalendar([{ ...event, location: "" }], "https://harmony.example", now);
    expect(ics).toContain("LOCATION:Lieu à préciser");
  });

  it("liste plusieurs événements dans un seul calendrier", () => {
    const second: EventRow = {
      ...event,
      id: "22222222-2222-2222-2222-222222222222",
      title: "Réunion",
    };
    const ics = eventsToIcsCalendar([event, second], "https://harmony.example", now);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
  });
});
