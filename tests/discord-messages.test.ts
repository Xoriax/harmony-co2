import { describe, expect, it } from "vitest";
import { bilanAlertAnnouncement, eventAnnouncement } from "@/lib/discord-messages";

describe("eventAnnouncement", () => {
  it("inclut le titre, la date, le lieu et le lien vers /event", () => {
    const message = eventAnnouncement(
      {
        title: "Collecte de vêtements",
        location: "Local associatif",
        starts_at: "2026-10-01T14:00",
      },
      "https://harmony.example",
    );
    expect(message).toContain("Collecte de vêtements");
    expect(message).toContain("Local associatif");
    expect(message).toContain("https://harmony.example/event");
  });

  it("propose un lieu par défaut quand il est vide", () => {
    const message = eventAnnouncement(
      { title: "Réunion", location: "", starts_at: "2026-10-01T14:00" },
      "https://harmony.example",
    );
    expect(message).toContain("Lieu à préciser");
  });
});

describe("bilanAlertAnnouncement", () => {
  const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

  it("inclut le total, le seuil, le pseudo et le lien vers /historique", () => {
    const message = bilanAlertAnnouncement(
      { userName: "Alix", total: 1234.5 },
      1000,
      "https://harmony.example",
    );
    expect(message).toContain("Alix");
    expect(message).toContain(nf.format(1234.5));
    expect(message).toContain(nf.format(1000));
    expect(message).toContain("https://harmony.example/historique");
  });
});
