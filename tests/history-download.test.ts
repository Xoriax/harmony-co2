import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getSession = vi.fn();
const getBilan = vi.fn();
const signedFileUrl = vi.fn();

vi.mock("@/lib/session", () => ({ getSession: () => getSession() }));
vi.mock("@/lib/bilans", () => ({
  getBilan: (id: string, userId: string) => getBilan(id, userId),
  signedFileUrl: (path: string, name: string) => signedFileUrl(path, name),
}));

import { GET } from "@/app/historique/fichier/[id]/route";

const ID = "3f2b8c1e-5d4a-4b7e-9c1a-0a1b2c3d4e5f";
const request = (id: string, query = "") =>
  GET(new NextRequest(`http://localhost:3000/historique/fichier/${id}${query}`), {
    params: Promise.resolve({ id }),
  });

const location = (response: Response) => response.headers.get("location");

beforeEach(() => {
  getSession.mockReset().mockResolvedValue({ id: "user-1", name: "Camille", admin: false });
  getBilan.mockReset().mockResolvedValue({
    id: ID,
    created_at: "2026-09-21T10:30:00Z",
    pdf_path: "user-1/bilan.pdf",
    xlsx_path: "user-1/bilan.xlsx",
  });
  signedFileUrl.mockReset().mockResolvedValue("https://storage.example/signed?token=abc");
});

describe("téléchargement d'un fichier de l'historique", () => {
  it("renvoie vers la connexion sans session", async () => {
    getSession.mockResolvedValue(null);
    const response = await request(ID);
    expect(location(response)).toBe("http://localhost:3000/connexion");
    expect(getBilan).not.toHaveBeenCalled();
  });

  it("redirige vers le fichier PDF signé par défaut, avec un nom daté", async () => {
    const response = await request(ID);
    expect(location(response)).toBe("https://storage.example/signed?token=abc");
    expect(getBilan).toHaveBeenCalledWith(ID, "user-1");
    expect(signedFileUrl).toHaveBeenCalledWith(
      "user-1/bilan.pdf",
      "bilan-carbone-harmony-2026-09-21.pdf",
    );
  });

  it("sert l'Excel quand il est demandé", async () => {
    await request(ID, "?format=xlsx");
    expect(signedFileUrl).toHaveBeenCalledWith(
      "user-1/bilan.xlsx",
      "bilan-carbone-harmony-2026-09-21.xlsx",
    );
  });

  it("traite tout autre format comme un PDF", async () => {
    await request(ID, "?format=exe");
    expect(signedFileUrl).toHaveBeenCalledWith("user-1/bilan.pdf", expect.stringMatching(/\.pdf$/));
  });

  it("ramène à l'historique, avec un message, pour un identifiant invalide", async () => {
    const response = await request("../../etc/passwd");
    expect(location(response)).toBe("http://localhost:3000/historique?notice=missing");
    expect(getBilan).not.toHaveBeenCalled();
  });

  it("ne donne jamais le bilan d'un autre utilisateur (recherche limitée à ta session)", async () => {
    getBilan.mockResolvedValue(null);
    const response = await request(ID);
    expect(getBilan).toHaveBeenCalledWith(ID, "user-1");
    expect(location(response)).toBe("http://localhost:3000/historique?notice=missing");
    expect(signedFileUrl).not.toHaveBeenCalled();
  });

  it("signale un fichier momentanément indisponible", async () => {
    signedFileUrl.mockResolvedValue(null);
    const response = await request(ID);
    expect(location(response)).toBe("http://localhost:3000/historique?notice=unavailable");
  });
});
