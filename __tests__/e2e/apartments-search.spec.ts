import { test, expect } from "@playwright/test";

async function openFiltersIfMobile(page: import("@playwright/test").Page) {
  const mobileFilters = page.getByRole("button", { name: /^filters$/i });
  if (await mobileFilters.isVisible().catch(() => false)) {
    await mobileFilters.click();
  }
}

async function closeFiltersDrawerIfOpen(page: import("@playwright/test").Page) {
  const backdrop = page.locator("div.fixed.inset-0.z-\\[2000\\] div.absolute.inset-0.bg-black\\/50");
  if (await backdrop.first().isVisible().catch(() => false)) {
    await backdrop.first().click({ trial: false }).catch(() => {});
  }
}

test.describe("Apartments search page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/apartments");
    await page.waitForLoadState("networkidle");
  });

  test("renders the KTM Apartments navbar logo", async ({ page }) => {
    await expect(page.locator("nav").getByText(/KTM/)).toBeVisible();
  });

  test("renders the filter panel with core property type buttons", async ({ page }) => {
    await openFiltersIfMobile(page);
    await expect(page.getByRole("button", { name: /apartment/i })).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole("button", { name: /room/i })).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole("button", { name: /studio/i })).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole("button", { name: /house/i })).toBeVisible({ timeout: 20000 });
    await closeFiltersDrawerIfOpen(page);
  });

  test("renders the sort control", async ({ page }) => {
    await expect(page.locator('[data-testid="sort-trigger"]')).toBeVisible({ timeout: 15000 });
  });

  test("renders the footer with navigation links", async ({ page }) => {
    await expect(page.getByRole("link", { name: /privacy policy/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /terms of service/i })).toBeVisible();
  });

  test("clicking Apartment filter button adds active CSS class", async ({ page }) => {
    await openFiltersIfMobile(page);
    const btn = page.getByRole("button", { name: /^apartment$/i }).first();
    await expect(btn).toBeVisible({ timeout: 20000 });
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await expect(btn).toHaveClass(/filter-chip-active|border-accent/, { timeout: 20000 });
    await closeFiltersDrawerIfOpen(page);
  });

  test("price range quick-select updates URL params", async ({ page }) => {
    await openFiltersIfMobile(page);
    const chip = page.getByRole("button", { name: /under 10k/i }).first();
    await expect(chip).toBeVisible({ timeout: 20000 });
    await chip.scrollIntoViewIfNeeded();
    await chip.click();
    await page.waitForURL(/max_price=10000/, { timeout: 20000 });
    await expect(page).toHaveURL(/max_price=10000/);
    await closeFiltersDrawerIfOpen(page);
  });

  test("sort dropdown changes URL sort param", async ({ page }) => {
    const sortTrigger = page.locator('[data-testid="sort-trigger"]');
    await expect(sortTrigger).toBeVisible({ timeout: 15000 });
    await sortTrigger.click();
    const priceAscOption = page.locator('[data-testid="sort-option-price-asc"]');
    await expect(priceAscOption).toBeVisible({ timeout: 10000 });
    await priceAscOption.click();
    await page.waitForURL(/sort_by=price/, { timeout: 25000 });
    await expect(page).toHaveURL(/sort_by=price/);
    await expect(page).toHaveURL(/sort_order=asc/);
  });

  test("renders mobile bottom navigation on small screens", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/apartments");
    await page.waitForLoadState("networkidle");
    const mobileNav = page.locator("nav").last();
    await expect(mobileNav).toBeVisible({ timeout: 20000 });
  });
});
