import { test, expect } from "@playwright/test";

test("home page does not link to /neighborhoods", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const bad = page.locator('a[href^="/neighborhoods"]');
  await expect(bad).toHaveCount(0);
});
