import { expect, test } from "@playwright/test";
import { computeMinimalBilan } from "./utils/bilan";

test.describe("Export du bilan", () => {
  test("export PDF", async ({ page }) => {
    await computeMinimalBilan(page);

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Exporter en PDF" }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });

  test("export Excel", async ({ page }) => {
    await computeMinimalBilan(page);

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Exporter en Excel" }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/\.xlsx$/);
  });

  test("export CSV", async ({ page }) => {
    await computeMinimalBilan(page);

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Exporter en CSV" }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/\.csv$/);
  });
});
