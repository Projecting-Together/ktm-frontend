import { test, expect } from "@playwright/test";

test("legacy neighborhood routes redirect to apartments search", async ({ page }) => {
  for (const path of ["/neighborhoods", "/neighborhoods/thamel"]) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response, `response for ${path}`).not.toBeNull();
    expect(response!.status(), `status for ${path}`).toBeLessThan(400);
    await expect(page).toHaveURL(/\/apartments/);
  }
});
