import { test, expect } from "@playwright/test";

const filterPanel = (page: import("@playwright/test").Page) => {
  const isMobile = test.info().project.name === "Mobile Chrome";
  return isMobile ? page.getByTestId("search-filter-panel-drawer") : page.getByTestId("search-filter-panel-sidebar");
};

async function openMobileFilterDrawerIfPresent(page: import("@playwright/test").Page) {
  if (test.info().project.name !== "Mobile Chrome") return;
  const filtersBtn = page.getByRole("button", { name: /^filters$/i }).first();
  await expect(filtersBtn).toBeVisible({ timeout: 30_000 });
  await filtersBtn.click();
  await expect(page.getByTestId("search-filter-panel-drawer")).toBeVisible({ timeout: 15_000 });
}

test.describe("Home / Apartments Search Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/apartments", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("load");
  });

  test("renders the KTM Apartments navbar logo", async ({ page }) => {
    await expect(page.locator("nav").getByText(/KTM/)).toBeVisible();
  });

  test("renders the filter panel with property type buttons", async ({ page }) => {
    await openMobileFilterDrawerIfPresent(page);
    const panel = filterPanel(page);
    await expect(panel.getByRole("button", { name: /apartment/i })).toBeVisible();
    await expect(panel.getByRole("button", { name: /room/i })).toBeVisible();
    await expect(panel.getByRole("button", { name: /studio/i })).toBeVisible();
    await expect(panel.getByRole("button", { name: /house/i })).toBeVisible();
  });

  test("renders the sort control", async ({ page }) => {
    await expect(page.locator('[data-testid="sort-trigger"]')).toBeVisible({ timeout: 10000 });
  });

  test("renders the footer with navigation links", async ({ page }) => {
    await expect(page.getByRole("link", { name: /privacy policy/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /terms of service/i })).toBeVisible();
  });

  test("clicking Apartment filter button updates URL params", async ({ page }) => {
    await openMobileFilterDrawerIfPresent(page);
    const panel = filterPanel(page);
    const btn = panel.getByRole("button", { name: /^apartment$/i }).first();
    await btn.click();
    await page.waitForURL(/listing_type=apartment/, { timeout: 15000 });
    await expect(page).toHaveURL(/listing_type=apartment/);
  });

  test("clicking Room filter button updates URL params", async ({ page }) => {
    await openMobileFilterDrawerIfPresent(page);
    await filterPanel(page).getByRole("button", { name: /^room$/i }).first().click();
    await page.waitForURL(/listing_type=room/, { timeout: 15000 });
    await expect(page).toHaveURL(/listing_type=room/);
  });

  test("maximum price input updates URL params", async ({ page }) => {
    await openMobileFilterDrawerIfPresent(page);
    const maxInput = filterPanel(page).getByRole("spinbutton", { name: /^maximum price$/i });
    await maxInput.scrollIntoViewIfNeeded();
    await maxInput.fill("10000");
    await maxInput.press("Tab");
    await page.waitForURL(/max_price=10000/, { timeout: 15000 });
    await expect(page).toHaveURL(/max_price=10000/);
  });

  test("sort dropdown changes URL sort param", async ({ page }) => {
    const sortTrigger = page.locator('[data-testid="sort-trigger"]');
    await expect(sortTrigger).toBeVisible({ timeout: 10000 });
    await sortTrigger.click();
    const priceAscOption = page.locator('[data-testid="sort-option-price-asc"]');
    await expect(priceAscOption).toBeVisible({ timeout: 5000 });
    await priceAscOption.click();
    await page.waitForURL(/sort_by=price/, { timeout: 20000 });
    await expect(page).toHaveURL(/sort_by=price/);
    await expect(page).toHaveURL(/sort_order=asc/);
  });

  test("purpose toggle switches between Rent and Buy in URL", async ({ page }) => {
    const purposeGroup = page.getByRole("group", { name: /listing purpose/i });
    const rentButton = purposeGroup.getByRole("button", { name: /^rent$/i });
    const buyButton = purposeGroup.getByRole("button", { name: /^buy$/i });

    await expect(rentButton).toHaveAttribute("aria-pressed", "true");
    await expect(page).not.toHaveURL(/purpose=sale/);

    await buyButton.click();
    await page.waitForURL(/purpose=sale/, { timeout: 20_000 });
    await expect(buyButton).toHaveAttribute("aria-pressed", "true");
    await expect(rentButton).toHaveAttribute("aria-pressed", "false");

    await rentButton.click();
    await page.waitForFunction(() => !window.location.search.includes("purpose=sale"), {
      timeout: 20_000,
    });
    await expect(rentButton).toHaveAttribute("aria-pressed", "true");
  });

  test("renders mobile bottom navigation on small screens", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/apartments", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("load");
    const mobileNav = page.locator("nav").last();
    await expect(mobileNav).toBeVisible();
  });

  test("root route redirects to apartments with buy toggle available", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("load");
    await expect(page).toHaveURL(/\/apartments(?:\?|$)/);

    const purposeGroup = page.getByRole("group", { name: /listing purpose/i });
    await expect(purposeGroup.getByRole("button", { name: /^buy$/i })).toBeVisible();
  });
});
