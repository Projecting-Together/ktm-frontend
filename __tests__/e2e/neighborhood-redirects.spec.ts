import { test, expect } from "@playwright/test";

test("legacy neighborhood routes redirect to listings search", async ({ page }) => {
  const root = await page.goto("/neighborhoods", { waitUntil: "domcontentloaded" });
  expect(root).not.toBeNull();
  expect(root!.status()).toBeLessThan(400);
  await expect(page).toHaveURL(/\/listings$/);

  const slug = await page.goto("/neighborhoods/thamel", { waitUntil: "domcontentloaded" });
  expect(slug).not.toBeNull();
  expect(slug!.status()).toBeLessThan(400);
  await expect(page).toHaveURL(/\/listings/);
  await expect(page).toHaveURL(/city_slug=thamel/);
});
