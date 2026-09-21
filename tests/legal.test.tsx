import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Fill } from "@/app/legal/legal-page";
import { SiteFooter } from "@/app/site-footer";

describe("pied de page", () => {
  it("renvoie vers les mentions légales et la politique de confidentialité", () => {
    const html = renderToStaticMarkup(<SiteFooter />);
    expect(html).toContain('href="/mentions-legales"');
    expect(html).toContain('href="/confidentialite"');
  });
});

describe("valeur légale", () => {
  it("affiche la valeur renseignée", () => {
    expect(renderToStaticMarkup(<Fill value="Association Harmony" />)).toBe("Association Harmony");
  });

  it("signale clairement une valeur manquante", () => {
    expect(renderToStaticMarkup(<Fill value={null} />)).toContain("à compléter");
  });
});
