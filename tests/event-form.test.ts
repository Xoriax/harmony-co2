import { describe, expect, it } from "vitest";
import { parseEventForm } from "@/lib/event-form";

const form = (fields: Record<string, string | File> = {}) => {
  const data = new FormData();
  const base: Record<string, string | File> = {
    title: "Atelier fresque du climat",
    description: "Venez nombreux.",
    location: "Salle 12",
    starts_at: "2026-10-01T18:00",
    ends_at: "2026-10-01T20:00",
    published: "on",
    ...fields,
  };
  for (const [key, value] of Object.entries(base)) data.set(key, value);
  return data;
};

const without = (data: FormData, key: string) => {
  data.delete(key);
  return data;
};

describe("parseEventForm : cas valide", () => {
  it("prépare la ligne à enregistrer, avec les heures complétées en secondes", () => {
    const { error, row } = parseEventForm(form());
    expect(error).toBeNull();
    expect(row).toEqual({
      title: "Atelier fresque du climat",
      description: "Venez nombreux.",
      location: "Salle 12",
      starts_at: "2026-10-01T18:00:00",
      ends_at: "2026-10-01T20:00:00",
      published: true,
    });
  });

  it("retire les espaces autour des champs texte", () => {
    const { row } = parseEventForm(form({ title: "  Atelier  ", location: " Salle 12 " }));
    expect(row.title).toBe("Atelier");
    expect(row.location).toBe("Salle 12");
  });

  it("accepte un lieu et une description vides", () => {
    expect(parseEventForm(form({ location: "", description: "" })).error).toBeNull();
  });

  it("marque l'événement en brouillon quand « publié » est décoché", () => {
    expect(parseEventForm(without(form(), "published")).row.published).toBe(false);
  });

  it("renvoie les valeurs saisies pour réafficher le formulaire en cas d'erreur", () => {
    const { values } = parseEventForm(form({ title: "" }));
    expect(values).toMatchObject({ location: "Salle 12", starts_at: "2026-10-01T18:00" });
  });
});

describe("parseEventForm : erreurs", () => {
  it("exige un titre", () => {
    expect(parseEventForm(form({ title: "   " })).error).toBe("Le titre est obligatoire.");
  });

  it("limite le titre à 120 caractères (120 accepté, 121 refusé)", () => {
    expect(parseEventForm(form({ title: "T".repeat(120) })).error).toBeNull();
    expect(parseEventForm(form({ title: "T".repeat(121) })).error).toBe(
      "Le titre ne doit pas dépasser 120 caractères.",
    );
  });

  it("limite le lieu à 120 caractères et la description à 2000", () => {
    expect(parseEventForm(form({ location: "L".repeat(121) })).error).toBe(
      "Le lieu ne doit pas dépasser 120 caractères.",
    );
    expect(parseEventForm(form({ description: "D".repeat(2000) })).error).toBeNull();
    expect(parseEventForm(form({ description: "D".repeat(2001) })).error).toBe(
      "La description ne doit pas dépasser 2000 caractères.",
    );
  });

  it("exige une date de début valide", () => {
    const message = "La date de début est obligatoire.";
    expect(parseEventForm(form({ starts_at: "" })).error).toBe(message);
    expect(parseEventForm(form({ starts_at: "demain" })).error).toBe(message);
    expect(parseEventForm(form({ starts_at: "2026-10-01" })).error).toBe(message);
  });

  it("exige une date de fin (obligatoire) et valide", () => {
    expect(parseEventForm(form({ ends_at: "" })).error).toBe("La date de fin est obligatoire.");
    expect(parseEventForm(form({ ends_at: "2026-10-01" })).error).toBe(
      "La date de fin est invalide.",
    );
  });

  it("refuse une fin qui n'est pas strictement après le début", () => {
    const message = "La fin doit être après le début.";
    expect(parseEventForm(form({ ends_at: "2026-10-01T18:00" })).error).toBe(message);
    expect(parseEventForm(form({ ends_at: "2026-10-01T17:59" })).error).toBe(message);
    expect(parseEventForm(form({ ends_at: "2026-10-01T18:01" })).error).toBeNull();
  });

  it("accepte un événement sur plusieurs jours", () => {
    expect(parseEventForm(form({ ends_at: "2026-10-03T12:00" })).error).toBeNull();
  });
});

describe("parseEventForm : image de couverture", () => {
  const image = (type: string, bytes = 10) => new File([new Uint8Array(bytes)], "cover", { type });

  it("retient l'image envoyée quand elle est valide", () => {
    const { cover, error } = parseEventForm(form({ cover: image("image/png") }));
    expect(error).toBeNull();
    expect(cover).toBeInstanceOf(File);
  });

  it("ignore un champ image laissé vide", () => {
    expect(parseEventForm(form({ cover: image("image/png", 0) })).cover).toBeNull();
  });

  it("refuse un fichier qui n'est pas une image acceptée", () => {
    expect(parseEventForm(form({ cover: image("application/pdf") })).error).toBe(
      "L'image doit être au format JPG, PNG, WebP ou GIF.",
    );
  });

  it("refuse une image de plus de 5 Mo", () => {
    expect(parseEventForm(form({ cover: image("image/png", 5 * 1024 * 1024 + 1) })).error).toBe(
      "L'image ne doit pas dépasser 5 Mo.",
    );
  });

  it("détecte la demande de suppression de la couverture", () => {
    expect(parseEventForm(form({ remove_cover: "on" })).removeCoverRequested).toBe(true);
    expect(parseEventForm(form()).removeCoverRequested).toBe(false);
  });
});
