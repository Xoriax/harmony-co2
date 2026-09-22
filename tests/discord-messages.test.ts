import { describe, expect, it } from "vitest";
import { bilanAlertPayload, eventAnnouncementPayload } from "@/lib/discord-messages";

const now = new Date("2026-09-22T10:00:00Z");

const event = {
  title: "Collecte de vêtements",
  description: "Une après-midi pour trier et donner des vêtements.",
  location: "Local associatif",
  starts_at: "2026-10-01T14:00",
  ends_at: "2026-10-01T18:00",
  cover_url: null as string | null,
};

describe("eventAnnouncementPayload", () => {
  it("inclut le titre, la description, les dates, le lieu et le lien vers /event", () => {
    const payload = eventAnnouncementPayload(event, "https://harmony.example", null, now);
    const [embed] = payload.embeds;

    expect(embed.title).toContain("Collecte de vêtements");
    expect(embed.description).toContain("Une après-midi pour trier et donner");
    expect(embed.url).toBe("https://harmony.example/event");
    expect(embed.fields).toEqual([
      { name: "Début", value: expect.stringContaining("14:00"), inline: true },
      { name: "Fin", value: expect.stringContaining("18:00"), inline: true },
      { name: "Lieu", value: "Local associatif", inline: true },
    ]);
  });

  it("inclut l'image de couverture quand il y en a une", () => {
    const payload = eventAnnouncementPayload(
      { ...event, cover_url: "https://harmony.example/cover.jpg" },
      "https://harmony.example",
      null,
      now,
    );
    expect(payload.embeds[0].image).toEqual({ url: "https://harmony.example/cover.jpg" });
  });

  it("omet l'image quand il n'y en a pas", () => {
    const payload = eventAnnouncementPayload(event, "https://harmony.example", null, now);
    expect(payload.embeds[0].image).toBeUndefined();
  });

  it("omet la description quand elle est vide", () => {
    const payload = eventAnnouncementPayload(
      { ...event, description: "" },
      "https://harmony.example",
      null,
      now,
    );
    expect(payload.embeds[0].description).toBeUndefined();
  });

  it("propose un lieu par défaut quand il est vide", () => {
    const payload = eventAnnouncementPayload(
      { ...event, location: "" },
      "https://harmony.example",
      null,
      now,
    );
    expect(payload.embeds[0].fields?.find((f) => f.name === "Lieu")?.value).toBe("Lieu à préciser");
  });

  it("sans rôle : aucune mention dans content", () => {
    const payload = eventAnnouncementPayload(event, "https://harmony.example", null, now);
    expect(payload.content).toBeUndefined();
    expect(payload.allowed_mentions).toBeUndefined();
  });

  it("avec un rôle : mention dans content et liste blanche explicite", () => {
    const payload = eventAnnouncementPayload(event, "https://harmony.example", "999", now);
    expect(payload.content).toBe("<@&999>");
    expect(payload.allowed_mentions).toEqual({ roles: ["999"] });
  });

  it("tronque un titre ou une description trop longs", () => {
    const long = "a".repeat(3000);
    const payload = eventAnnouncementPayload(
      { ...event, title: long, description: long },
      "https://harmony.example",
      null,
      now,
    );
    expect(payload.embeds[0].title.length).toBeLessThanOrEqual(256);
    expect(payload.embeds[0].description?.length).toBeLessThanOrEqual(2000);
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
