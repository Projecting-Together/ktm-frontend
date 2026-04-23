import { test, expect } from "@playwright/test";

test.describe("Neighborhoods Removed", () => {
  test("navbar/footer/home surfaces do not expose neighborhoods links", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("link", { name: /^neighborhoods$/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /explore all neighborhoods/i })).toHaveCount(0);
    await expect(page.locator("footer")).not.toContainText(/popular neighborhoods/i);
  });

  test("neighborhoods index route returns 404", async ({ page }) => {
    const response = await page.goto("/neighborhoods");
    expect(response?.status()).toBe(404);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toContainText("This page could not be found");
  });

  test("neighborhood detail route returns 404", async ({ page }) => {
    const response = await page.goto("/neighborhoods/thamel");
    expect(response?.status()).toBe(404);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toContainText("This page could not be found");
  });
});
