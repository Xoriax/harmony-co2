import type { Page } from "@playwright/test";

// Sélectionne un smartphone en catégorie Numérique et lance le calcul : le strict minimum pour
// obtenir un résultat, réutilisé par les tests de calcul et d'export. Le facteur d'émission vient
// de la vraie API Impact CO2 (IMPACTCO2_TOKEN doit être une vraie valeur pour que ces tests passent).
export async function computeMinimalBilan(page: Page) {
  await page.goto("/bilan");

  // hasText fait une recherche de sous-chaîne insensible à la casse : un simple "Numérique"
  // accrocherait aussi la section "Usage numérique". Le nom exact isole la bonne section.
  const section = page
    .locator("section")
    .filter({ has: page.getByText("Numérique", { exact: true }) });
  await section.getByText("Inclure").click();
  await section.getByRole("combobox").selectOption({ label: "Smartphone" });
  await section.getByRole("spinbutton").fill("2");

  await page.getByRole("button", { name: "Calculer le bilan" }).click();
  await page.getByRole("heading", { name: "Répartition" }).waitFor({ timeout: 15_000 });
}
