import { expect, test } from "@playwright/test";
import { computeMinimalBilan } from "./utils/bilan";

test("calcule un bilan à partir d'un élément et affiche le détail par catégorie", async ({
  page,
}) => {
  await computeMinimalBilan(page);

  await expect(page.getByRole("heading", { name: "Numérique" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Smartphone" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "2 unité" })).toBeVisible();
  await expect(page.getByText("kgCO2e").first()).toBeVisible();
});

test("aucune catégorie incluse : le calcul reste désactivé", async ({ page }) => {
  await page.goto("/bilan");
  await expect(page.getByRole("button", { name: "Calculer le bilan" })).toBeDisabled();
});
