import { describe, expect, it } from "vitest";
import { eventsJsonLd } from "@/lib/event-jsonld";
import type { EventRow } from "@/lib/event-format";

const base: EventRow = {
  id: "1",
  title: "Collecte de vêtements",
  description: "Une après-midi pour trier et donner des vêtements.",
  location: "Local associatif",
  starts_at: "2026-10-01T14:00",
  ends_at: "2026-10-01T18:00",
  published: true,
  cover_url: null,
};

describe("eventsJsonLd", () => {
  it("produit un objet Event schema.org par événement à venir", () => {
    const [data] = eventsJsonLd(
      [base],
      "2026-09-22T10:00:00",
      "https://harmony.example",
      "Harmony CO2",
    );

    expect(data).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Event",
      name: "Collecte de vêtements",
      description: base.description,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: { "@type": "Place", name: "Local associatif" },
      organizer: { "@type": "Organization", name: "Harmony CO2", url: "https://harmony.example" },
      url: "https://harmony.example/event",
    });
    expect(data.startDate).toBe(new Date("2026-10-01T12:00:00Z").toISOString());
    expect(data.endDate).toBe(new Date("2026-10-01T16:00:00Z").toISOString());
  });

  it("exclut les événements déjà terminés", () => {
    const ended: EventRow = { ...base, starts_at: "2020-01-01T10:00", ends_at: "2020-01-01T12:00" };
    expect(
      eventsJsonLd([ended], "2026-09-22T10:00:00", "https://harmony.example", "Harmony CO2"),
    ).toEqual([]);
  });

  it("inclut l'image de couverture quand il y en a une", () => {
    const withCover = { ...base, cover_url: "https://harmony.example/cover.jpg" };
    const [data] = eventsJsonLd(
      [withCover],
      "2026-09-22T10:00:00",
      "https://harmony.example",
      "Harmony CO2",
    );
    expect(data.image).toEqual(["https://harmony.example/cover.jpg"]);
  });

  it("omet le champ image quand il n'y en a pas", () => {
    const [data] = eventsJsonLd(
      [base],
      "2026-09-22T10:00:00",
      "https://harmony.example",
      "Harmony CO2",
    );
    expect(data).not.toHaveProperty("image");
  });

  it("utilise un lieu par défaut quand il est vide", () => {
    const [data] = eventsJsonLd(
      [{ ...base, location: "" }],
      "2026-09-22T10:00:00",
      "https://harmony.example",
      "Harmony CO2",
    );
    expect(data.location.name).toBe("Lieu à préciser");
  });
});
