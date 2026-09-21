import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ErrorPage from "@/app/error";
import GlobalError from "@/app/global-error";

// global-error importe la feuille de styles : inutile pour ce test.
vi.mock("@/app/globals.css", () => ({}));

const failure = (digest?: string) => {
  const error = new Error("détail technique secret : mot de passe base de données") as Error & {
    digest?: string;
  };
  error.digest = digest;
  return error;
};

describe("page d'erreur", () => {
  it("propose de réessayer ou de revenir à l'accueil", () => {
    const html = renderToStaticMarkup(<ErrorPage error={failure()} reset={() => {}} />);
    expect(html).toContain("Quelque chose s&#x27;est mal passé");
    expect(html).toContain("Réessayer");
    expect(html).toContain('href="/"');
  });

  it("ne montre jamais le message technique de l'erreur", () => {
    const html = renderToStaticMarkup(<ErrorPage error={failure("abc123")} reset={() => {}} />);
    expect(html).not.toContain("détail technique secret");
    expect(html).not.toContain("mot de passe");
  });

  it("affiche la référence (digest) quand il y en a une", () => {
    const html = renderToStaticMarkup(<ErrorPage error={failure("abc123")} reset={() => {}} />);
    expect(html).toContain("abc123");
    expect(renderToStaticMarkup(<ErrorPage error={failure()} reset={() => {}} />)).not.toContain(
      "Référence",
    );
  });
});

describe("erreur grave (layout)", () => {
  it("rend une page complète, en français, sans détail technique", () => {
    const html = renderToStaticMarkup(<GlobalError error={failure("zzz")} reset={() => {}} />);
    expect(html).toContain('<html lang="fr"');
    expect(html).toContain("momentanément indisponible");
    expect(html).toContain("Réessayer");
    expect(html).not.toContain("détail technique secret");
  });
});
