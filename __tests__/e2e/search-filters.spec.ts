import { test, expect } from "@playwright/test";

test.describe("Search & Filter Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/apartments");
    await page.waitForLoadState("networkidle");
  });

  test("multiple filters combine in URL correctly", async ({ page }) => {
    await page.getByRole("button", { name: /^apartment$/i }).first().click();
    await page.waitForURL(/listing_type/, { timeout: 20000 });
    await page.getByRole("button", { name: /^thamel$/i }).first().click();
    await page.waitForURL(/neighborhood=thamel/, { timeout: 20000 });
    const url = page.url();
    expect(url).toMatch(/listing_type/);
    expect(url).toMatch(/neighborhood/);
  });

  test("verified toggle updates URL", async ({ page }) => {
    // Use data-testid for reliable targeting of the verified switch
    const verifiedSwitch = page.locator('[data-testid="toggle-verified"]');
    await expect(verifiedSwitch).toBeVisible({ timeout: 10000 });
    await verifiedSwitch.click();
    await page.waitForURL(/verified=true/, { timeout: 20000 });
    await expect(page).toHaveURL(/verified=true/);
  });

  test("price min/max inputs update URL on change", async ({ page }) => {
    const minInput = page.locator('input[placeholder*="Min" i]').first();
    if (await minInput.count() > 0) {
      await minInput.fill("15000");
      await minInput.press("Tab");
      await page.waitForURL(/min_price=15000/, { timeout: 20000 });
      await expect(page).toHaveURL(/min_price=15000/);
    } else {
      test.skip();
    }
  });

  test("fully furnished filter updates URL", async ({ page }) => {
    const furnishedLabel = page.getByText(/fully furnished/i).first();
    if (await furnishedLabel.count() > 0) {
      await furnishedLabel.click();
      await page.waitForURL(/furnishing=fully/, { timeout: 20000 });
      await expect(page).toHaveURL(/furnishing=fully/);
    } else {
      test.skip();
    }
  });

  test("URL params persist on page reload", async ({ page }) => {
    await page.getByRole("button", { name: /^thamel$/i }).first().click();
    await page.waitForURL(/neighborhood=thamel/, { timeout: 20000 });
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/neighborhood=thamel/);
  });

  test("clearing filters resets URL", async ({ page }) => {
    await page.getByRole("button", { name: /^thamel$/i }).first().click();
    await page.waitForURL(/neighborhood=thamel/, { timeout: 20000 });
    const clearBtn = page.getByRole("button", { name: /clear|reset/i }).first();
    if (await clearBtn.count() > 0) {
      await clearBtn.click();
      await page.waitForTimeout(2000);
      expect(page.url()).not.toMatch(/neighborhood=thamel/);
    } else {
      test.skip();
    }
  });

  test("sort by price low to high updates URL", async ({ page }) => {
    // Open the custom sort dropdown
    const sortTrigger = page.locator('[data-testid="sort-trigger"]');
    await expect(sortTrigger).toBeVisible({ timeout: 10000 });
    await sortTrigger.click();
    // Click the "Price: low to high" option
    const priceAscOption = page.locator('[data-testid="sort-option-price-asc"]');
    await expect(priceAscOption).toBeVisible({ timeout: 5000 });
    await priceAscOption.click();
    // URL should update
    await page.waitForURL(/sort_by=price/, { timeout: 20000 });
    await expect(page).toHaveURL(/sort_by=price/);
    await expect(page).toHaveURL(/sort_order=asc/);
  });
});
