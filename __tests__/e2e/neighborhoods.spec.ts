import { test, expect } from "@playwright/test";

test.describe("Neighborhoods Pages", () => {
  test("neighborhoods index page renders", async ({ page }) => {
    const response = await page.goto("/neighborhoods");
    expect(response?.status()).not.toBe(404);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toContainText("This page could not be found");
  });

  test("neighborhood detail page for thamel renders", async ({ page }) => {
    const response = await page.goto("/neighborhoods/thamel");
    expect(response?.status()).not.toBe(404);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toContainText("This page could not be found");
    const body = await page.textContent("body");
    expect(body?.toLowerCase()).toContain("thamel");
  });

  test("neighborhood detail page for lazimpat renders", async ({ page }) => {
    const response = await page.goto("/neighborhoods/lazimpat");
    expect(response?.status()).not.toBe(404);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toContainText("This page could not be found");
    const body = await page.textContent("body");
    expect(body?.toLowerCase()).toContain("lazimpat");
  });

  test("neighborhood detail page for patan renders", async ({ page }) => {
    const response = await page.goto("/neighborhoods/patan");
    expect(response?.status()).not.toBe(404);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toContainText("This page could not be found");
    const body = await page.textContent("body");
    expect(body?.toLowerCase()).toContain("patan");
  });

  test("neighborhood index shows Kathmandu neighborhoods", async ({ page }) => {
    await page.goto("/neighborhoods");
    await page.waitForLoadState("networkidle");
    const body = await page.textContent("body");
    expect(body?.toLowerCase()).toContain("thamel");
    expect(body?.toLowerCase()).toContain("lazimpat");
    expect(body?.toLowerCase()).toContain("patan");
  });
});
