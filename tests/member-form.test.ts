import { describe, expect, it } from "vitest";
import { parseMemberForm } from "@/lib/member-form";

const form = (fields: Record<string, string | File> = {}, omit: string[] = []) => {
  const data = new FormData();
  const base: Record<string, string | File> = {
    name: "Camille Durand",
    role: "Responsable RSE",
    team: "rse",
    email: "camille@example.org",
    discord: "camille",
    position: "2",
    show_photo: "on",
    show_email: "on",
    show_discord: "on",
    ...fields,
  };
  for (const [key, value] of Object.entries(base)) {
    if (!omit.includes(key)) data.set(key, value);
  }
  return data;
};

describe("parseMemberForm : cas valide", () => {
  it("prépare la ligne à enregistrer", () => {
    const { error, row, position } = parseMemberForm(form());
    expect(error).toBeNull();
    expect(position).toBe(2);
    expect(row).toEqual({
      name: "Camille Durand",
      role: "Responsable RSE",
      team: "rse",
      email: "camille@example.org",
      discord: "camille",
      show_photo: true,
      show_email: true,
      show_discord: true,
    });
  });

  it("enregistre les éléments décochés comme masqués", () => {
    const { row } = parseMemberForm(form({}, ["show_email", "show_photo"]));
    expect(row).toMatchObject({ show_photo: false, show_email: false, show_discord: true });
  });

  it("accepte les deux groupes et des contacts vides", () => {
    expect(parseMemberForm(form({ team: "bureau", email: "", discord: "" })).error).toBeNull();
  });

  it("renvoie une position nulle quand l'ordre est vide (le serveur choisit)", () => {
    expect(parseMemberForm(form({ position: "" })).position).toBeNull();
  });

  it("accepte la position 0 et 9999", () => {
    expect(parseMemberForm(form({ position: "0" })).error).toBeNull();
    expect(parseMemberForm(form({ position: "9999" })).error).toBeNull();
  });
});

describe("parseMemberForm : erreurs", () => {
  it("exige un nom et un poste", () => {
    expect(parseMemberForm(form({ name: " " })).error).toBe("Le nom est obligatoire.");
    expect(parseMemberForm(form({ role: "" })).error).toBe("Le poste est obligatoire.");
  });

  it("limite le nom et le poste à 80 caractères", () => {
    expect(parseMemberForm(form({ name: "N".repeat(80) })).error).toBeNull();
    expect(parseMemberForm(form({ name: "N".repeat(81) })).error).toBe(
      "Le nom ne doit pas dépasser 80 caractères.",
    );
    expect(parseMemberForm(form({ role: "R".repeat(81) })).error).toBe(
      "Le poste ne doit pas dépasser 80 caractères.",
    );
  });

  it("refuse un groupe inconnu ou absent", () => {
    expect(parseMemberForm(form({ team: "direction" })).error).toBe("Choisis un groupe.");
    expect(parseMemberForm(form({}, ["team"])).error).toBe("Choisis un groupe.");
  });

  it.each(["pas-un-mail", "a@b", "a b@c.fr", "@example.org", "camille@"])(
    "refuse l'adresse e-mail %j",
    (email) => {
      expect(parseMemberForm(form({ email })).error).toBe("L'adresse e-mail est invalide.");
    },
  );

  it("accepte un e-mail de 120 caractères et refuse au-delà", () => {
    const at120 = `${"a".repeat(115)}@b.fr`; // 120 caractères
    const at121 = `${"a".repeat(116)}@b.fr`;
    expect(at120).toHaveLength(120);
    expect(parseMemberForm(form({ email: at120 })).error).toBeNull();
    expect(parseMemberForm(form({ email: at121 })).error).toBe("L'adresse e-mail est invalide.");
  });

  it("limite le Discord à 60 caractères", () => {
    expect(parseMemberForm(form({ discord: "d".repeat(60) })).error).toBeNull();
    expect(parseMemberForm(form({ discord: "d".repeat(61) })).error).toBe(
      "Le Discord ne doit pas dépasser 60 caractères.",
    );
  });

  it.each(["-1", "1.5", "10000", "abc", "1e9"])("refuse l'ordre %j", (position) => {
    expect(parseMemberForm(form({ position })).error).toBe(
      "L'ordre doit être un nombre entier positif.",
    );
  });
});

describe("parseMemberForm : photo", () => {
  const image = (type: string, bytes = 10) => new File([new Uint8Array(bytes)], "photo", { type });

  it("retient une photo valide", () => {
    const { photo, error } = parseMemberForm(form({ photo: image("image/jpeg") }));
    expect(error).toBeNull();
    expect(photo).toBeInstanceOf(File);
  });

  it("ignore un champ photo laissé vide", () => {
    expect(parseMemberForm(form({ photo: image("image/jpeg", 0) })).photo).toBeNull();
  });

  it("refuse un format ou une taille invalide", () => {
    expect(parseMemberForm(form({ photo: image("image/svg+xml") })).error).toBe(
      "L'image doit être au format JPG, PNG, WebP ou GIF.",
    );
    expect(parseMemberForm(form({ photo: image("image/png", 5 * 1024 * 1024 + 1) })).error).toBe(
      "L'image ne doit pas dépasser 5 Mo.",
    );
  });

  it("détecte la demande de suppression de la photo", () => {
    expect(parseMemberForm(form({ remove_photo: "on" })).removePhoto).toBe(true);
    expect(parseMemberForm(form()).removePhoto).toBe(false);
  });
});
