import { test, expect } from "@playwright/test";

test.describe("Neighborhoods Removed", () => {
  test("navbar/footer/home surfaces do not expose neighborhoods links", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("load");

    await expect(page.getByRole("link", { name: /^neighborhoods$/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /explore all neighborhoods/i })).toHaveCount(0);
    await expect(page.locator("footer")).not.toContainText(/popular neighborhoods/i);
    await expect(page.locator('a[href*="neighborhood="]')).toHaveCount(0);
  });

  test("neighborhoods index route returns 404", async ({ page, request }) => {
    const head = await request.get("/neighborhoods");
    expect(head.status()).toBe(404);

    await page.goto("/neighborhoods", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(/could not be found|not found/i);
  });

  test("neighborhood detail route returns 404", async ({ page, request }) => {
    const head = await request.get("/neighborhoods/thamel");
    expect(head.status()).toBe(404);

    await page.goto("/neighborhoods/thamel", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(/could not be found|not found/i);
  });
});
