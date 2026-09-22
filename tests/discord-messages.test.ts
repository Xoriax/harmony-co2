import { describe, expect, it } from "vitest";
import { bilanAlertPayload, eventAnnouncementPayload } from "@/lib/discord-messages";

const now = new Date("2026-09-22T10:00:00Z");

describe("eventAnnouncementPayload", () => {
  it("inclut le titre, la date, le lieu et le lien vers /event dans l'embed", () => {
    const payload = eventAnnouncementPayload(
      {
        title: "Collecte de vêtements",
        location: "Local associatif",
        starts_at: "2026-10-01T14:00",
      },
      "https://harmony.example",
      null,
      now,
    );
    const [embed] = payload.embeds;
    expect(embed.title).toContain("Collecte de vêtements");
    expect(embed.description).toContain("Local associatif");
    expect(embed.url).toBe("https://harmony.example/event");
  });

  it("propose un lieu par défaut quand il est vide", () => {
    const payload = eventAnnouncementPayload(
      { title: "Réunion", location: "", starts_at: "2026-10-01T14:00" },
      "https://harmony.example",
      null,
      now,
    );
    expect(payload.embeds[0].description).toContain("Lieu à préciser");
  });

  it("sans rôle : aucune mention dans content", () => {
    const payload = eventAnnouncementPayload(
      { title: "Réunion", location: "Local", starts_at: "2026-10-01T14:00" },
      "https://harmony.example",
      null,
      now,
    );
    expect(payload.content).toBeUndefined();
    expect(payload.allowed_mentions).toBeUndefined();
  });

  it("avec un rôle : mention dans content et liste blanche explicite", () => {
    const payload = eventAnnouncementPayload(
      { title: "Réunion", location: "Local", starts_at: "2026-10-01T14:00" },
      "https://harmony.example",
      "999",
      now,
    );
    expect(payload.content).toBe("<@&999>");
    expect(payload.allowed_mentions).toEqual({ roles: ["999"] });
  });
});

describe("bilanAlertPayload", () => {
  const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

  it("inclut le total, le seuil, le pseudo et le lien vers /historique, sans mention", () => {
    const payload = bilanAlertPayload(
      { userName: "Alix", total: 1234.5 },
      1000,
      "https://harmony.example",
      now,
    );
    const [embed] = payload.embeds;
    expect(embed.description).toContain("Alix");
    expect(embed.description).toContain(nf.format(1234.5));
    expect(embed.description).toContain(nf.format(1000));
    expect(embed.url).toBe("https://harmony.example/historique");
    expect(payload.content).toBeUndefined();
  });
});
