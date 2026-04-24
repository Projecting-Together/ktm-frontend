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

test.describe("Search & Filter Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/apartments", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("load");
  });

  test("multiple filters combine in URL correctly", async ({ page }) => {
    await openMobileFilterDrawerIfPresent(page);
    const panel = filterPanel(page);
    await expect(panel).toBeVisible({ timeout: 15_000 });
    await panel.getByRole("button", { name: /^apartment$/i }).first().click();
    await page.waitForURL(/listing_type=apartment/, { timeout: 20000 });
    const verifiedSwitch = panel.locator('[data-testid="toggle-verified"]');
    await expect(verifiedSwitch).toBeVisible({ timeout: 10000 });
    await verifiedSwitch.click();
    await page.waitForURL(/verified=true/, { timeout: 20000 });
    const url = page.url();
    expect(url).toMatch(/listing_type=apartment/);
    expect(url).toMatch(/verified=true/);
  });

  test("verified toggle updates URL", async ({ page }) => {
    await openMobileFilterDrawerIfPresent(page);
    const verifiedSwitch = filterPanel(page).locator('[data-testid="toggle-verified"]');
    await expect(verifiedSwitch).toBeVisible({ timeout: 10000 });
    await verifiedSwitch.click();
    await page.waitForURL(/verified=true/, { timeout: 20000 });
    await expect(page).toHaveURL(/verified=true/);
  });

  test("price min/max inputs update URL on change", async ({ page }) => {
    await openMobileFilterDrawerIfPresent(page);
    const minInput = filterPanel(page).locator('input[placeholder*="Min" i]').first();
    await minInput.scrollIntoViewIfNeeded();
    await minInput.fill("15000");
    await minInput.press("Tab");
    await page.waitForURL(/min_price=15000/, { timeout: 20000 });
    await expect(page).toHaveURL(/min_price=15000/);
  });

  test("fully furnished filter updates URL", async ({ page }) => {
    await openMobileFilterDrawerIfPresent(page);
    const panel = filterPanel(page);
    const furnishedLabel = panel.getByText(/fully furnished/i).first();
    if (await furnishedLabel.count() > 0) {
      await furnishedLabel.scrollIntoViewIfNeeded();
      await furnishedLabel.click();
      await page.waitForURL(/furnishing=fully/, { timeout: 20000 });
      await expect(page).toHaveURL(/furnishing=fully/);
    } else {
      test.skip();
    }
  });

  test("URL params persist on page reload", async ({ page }) => {
    await openMobileFilterDrawerIfPresent(page);
    await filterPanel(page).getByRole("button", { name: /^apartment$/i }).first().click();
    await page.waitForURL(/listing_type=apartment/, { timeout: 20000 });
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/listing_type=apartment/);
    await openMobileFilterDrawerIfPresent(page);
    await expect(filterPanel(page)).toBeVisible({ timeout: 15_000 });
  });

  test("clearing filters resets URL", async ({ page }) => {
    await openMobileFilterDrawerIfPresent(page);
    const panel = filterPanel(page);
    await panel.getByRole("button", { name: /^apartment$/i }).first().click();
    await page.waitForURL(/listing_type=apartment/, { timeout: 20000 });
    const resetBtn = panel.getByRole("button", { name: /^reset$/i }).first();
    await expect(resetBtn).toBeVisible({ timeout: 5000 });
    await resetBtn.click();
    await page.waitForFunction(() => !window.location.search.includes("listing_type=apartment"), {
      timeout: 15000,
    });
    expect(page.url()).not.toMatch(/listing_type=apartment/);
  });

  test("sort by price low to high updates URL", async ({ page }) => {
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

  test("purpose URL on load controls Rent/Buy active state", async ({ page }) => {
    await page.goto("/apartments?purpose=sale", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("load");

    const purposeGroup = page.getByRole("group", { name: /listing purpose/i });
    const rentButton = purposeGroup.getByRole("button", { name: /^rent$/i });
    const buyButton = purposeGroup.getByRole("button", { name: /^buy$/i });

    await expect(buyButton).toHaveAttribute("aria-pressed", "true");
    await expect(rentButton).toHaveAttribute("aria-pressed", "false");
    await expect(page).toHaveURL(/purpose=sale/);
  });

  test("purpose defaults to Rent when URL purpose is absent", async ({ page }) => {
    await page.goto("/apartments", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("load");

    const purposeGroup = page.getByRole("group", { name: /listing purpose/i });
    const rentButton = purposeGroup.getByRole("button", { name: /^rent$/i });
    const buyButton = purposeGroup.getByRole("button", { name: /^buy$/i });

    await expect(rentButton).toHaveAttribute("aria-pressed", "true");
    await expect(buyButton).toHaveAttribute("aria-pressed", "false");
    await expect(page).not.toHaveURL(/purpose=sale/);
  });

  test("buy mode stays active after applying listing-type filters", async ({ page }) => {
    await page.goto("/apartments?purpose=sale", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("load");
    await openMobileFilterDrawerIfPresent(page);
    await filterPanel(page).getByRole("button", { name: /^apartment$/i }).first().click();

    await page.waitForURL((url) => {
      return (
        url.pathname === "/apartments" &&
        url.searchParams.get("purpose") === "sale" &&
        url.searchParams.get("listing_type") === "apartment"
      );
    }, { timeout: 20_000 });

    const purposeGroup = page.getByRole("group", { name: /listing purpose/i });
    await expect(purposeGroup.getByRole("button", { name: /^buy$/i })).toHaveAttribute("aria-pressed", "true");
  });
});
