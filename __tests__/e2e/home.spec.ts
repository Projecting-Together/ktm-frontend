import { test, expect } from "@playwright/test";

test("home page does not link to /neighborhoods", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const bad = page.locator('a[href^="/neighborhoods"]');
  await expect(bad).toHaveCount(0);
});

test.describe("Home / Apartments Search Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/apartments");
    await page.waitForLoadState("networkidle");
  });

  test("renders the KTM Apartments navbar logo", async ({ page }) => {
    await expect(page.locator("nav").getByText(/KTM/)).toBeVisible();
  });

  test("renders the filter panel with property type buttons", async ({ page }) => {
    await expect(page.getByRole("button", { name: /apartment/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /room/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /studio/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /house/i })).toBeVisible();
  });

  test("renders all Kathmandu neighborhood filter buttons", async ({ page }) => {
    await expect(page.getByRole("button", { name: /thamel/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /lazimpat/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /patan/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /bhaktapur/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /koteshwor/i })).toBeVisible();
  });

  test("renders the sort dropdown", async ({ page }) => {
    await expect(page.getByRole("combobox")).toBeVisible();
  });

  test("renders the footer with navigation links", async ({ page }) => {
    await expect(page.getByRole("link", { name: /privacy policy/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /terms of service/i })).toBeVisible();
  });

  test("clicking Apartment filter button adds active CSS class", async ({ page }) => {
    const btn = page.getByRole("button", { name: /^apartment$/i }).first();
    await btn.click();
    await expect(btn).toHaveClass(/filter-chip-active/, { timeout: 15000 });
  });

  test("clicking Thamel neighborhood updates URL params", async ({ page }) => {
    await page.getByRole("button", { name: /^thamel$/i }).first().click();
    await page.waitForURL(/neighborhood=thamel/i, { timeout: 15000 });
    await expect(page).toHaveURL(/neighborhood=thamel/i);
  });

  test("price range quick-select updates URL params", async ({ page }) => {
    await page.getByRole("button", { name: /under 10k/i }).click();
    await page.waitForURL(/max_price=10000/, { timeout: 15000 });
    await expect(page).toHaveURL(/max_price=10000/);
  });

  test("sort dropdown changes URL sort param", async ({ page }) => {
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

  test("renders mobile bottom navigation on small screens", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/apartments");
    await page.waitForLoadState("networkidle");
    const mobileNav = page.locator("nav").last();
    await expect(mobileNav).toBeVisible();
  });
});
