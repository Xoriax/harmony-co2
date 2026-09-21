import { describe, expect, it } from "vitest";
import {
  groupByTeam,
  isTeam,
  toPublicMember,
  type MemberRow,
  type PublicMember,
} from "@/lib/mandat-format";

const member = (overrides: Partial<MemberRow> = {}): MemberRow => ({
  id: "m1",
  name: "Camille Durand",
  role: "Responsable RSE",
  team: "rse",
  photo_url: "https://cdn.example.com/mandat-photos/camille.jpg",
  email: "camille@example.org",
  discord: "camille#1234",
  show_photo: true,
  show_email: true,
  show_discord: true,
  position: 0,
  ...overrides,
});

describe("toPublicMember : éléments affichés", () => {
  it("expose tout ce qui est affichable", () => {
    expect(toPublicMember(member())).toEqual({
      id: "m1",
      name: "Camille Durand",
      role: "Responsable RSE",
      team: "rse",
      photo: { url: "https://cdn.example.com/mandat-photos/camille.jpg" },
      email: "camille@example.org",
      discord: "camille#1234",
    });
  });

  it("retire l'e-mail masqué : il n'existe plus dans l'objet transmis", () => {
    const publicMember = toPublicMember(member({ show_email: false }));
    expect(publicMember.email).toBeNull();
    expect(JSON.stringify(publicMember)).not.toContain("camille@example.org");
  });

  it("retire le Discord masqué", () => {
    const publicMember = toPublicMember(member({ show_discord: false }));
    expect(publicMember.discord).toBeNull();
    expect(JSON.stringify(publicMember)).not.toContain("camille#1234");
  });

  it("retire la photo masquée, y compris son adresse", () => {
    const publicMember = toPublicMember(member({ show_photo: false }));
    expect(publicMember.photo).toBeNull();
    expect(JSON.stringify(publicMember)).not.toContain("camille.jpg");
  });

  it("ne transmet aucun indicateur de visibilité ni de position", () => {
    const keys = Object.keys(toPublicMember(member())).sort();
    expect(keys).toEqual(["discord", "email", "id", "name", "photo", "role", "team"]);
  });

  it("distingue « photo masquée » de « photo affichée mais absente »", () => {
    expect(toPublicMember(member({ show_photo: true, photo_url: null })).photo).toEqual({
      url: null,
    });
    expect(toPublicMember(member({ show_photo: false, photo_url: null })).photo).toBeNull();
  });

  it("ne montre pas un champ affiché mais vide", () => {
    const publicMember = toPublicMember(member({ email: "", discord: "" }));
    expect(publicMember.email).toBeNull();
    expect(publicMember.discord).toBeNull();
  });

  it("masque tout d'un coup si tout est désactivé", () => {
    const publicMember = toPublicMember(
      member({ show_photo: false, show_email: false, show_discord: false }),
    );
    expect(publicMember).toMatchObject({ photo: null, email: null, discord: null });
  });
});

describe("groupByTeam", () => {
  const list = (team: MemberRow["team"], id: string): PublicMember =>
    toPublicMember(member({ id, team }));

  it("suit l'ordre des groupes (RSE puis Bureau) et conserve l'ordre des membres", () => {
    const groups = groupByTeam([list("bureau", "b1"), list("rse", "r1"), list("bureau", "b2")]);
    expect(groups.map((g) => g.label)).toEqual(["Responsable RSE", "Bureau restreint"]);
    expect(groups[1].list.map((m) => m.id)).toEqual(["b1", "b2"]);
  });

  it("omet un groupe sans membre", () => {
    expect(groupByTeam([list("bureau", "b1")]).map((g) => g.value)).toEqual(["bureau"]);
    expect(groupByTeam([])).toEqual([]);
  });
});

describe("isTeam", () => {
  it("reconnaît uniquement les groupes connus", () => {
    expect(isTeam("rse")).toBe(true);
    expect(isTeam("bureau")).toBe(true);
    expect(isTeam("autre")).toBe(false);
    expect(isTeam("")).toBe(false);
  });
});
