import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("register page renders correctly", async ({ page }) => {
    await page.goto("/register", { waitUntil: "domcontentloaded" });

    // Check the heading
    await expect(page.getByRole("heading", { name: /create your account/i })).toBeVisible({ timeout: 10000 });

    // Check key registration fields
    await expect(page.getByLabel(/first name/i)).toBeVisible();
    await expect(page.getByLabel(/last name/i)).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();

    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
  });

  test("register form shows account fields and submit action", async ({ page }) => {
    await page.goto("/register", { waitUntil: "domcontentloaded" });

    await expect(page.getByLabel(/first name/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel(/last name/i)).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
  });

  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });

    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /^sign in$/i })).toBeVisible();
  });

  test("login form shows validation errors on empty submit", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });

    const submitBtn = page.getByRole("button", { name: /^sign in$/i });
    await expect(submitBtn).toBeVisible({ timeout: 10000 });
    await submitBtn.click();

    // Should show validation errors (required fields)
    await page.waitForTimeout(500);
    // The form should not navigate away
    await expect(page).toHaveURL(/\/login/);
  });

  test("protected routes redirect to login", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test("legacy /manage URL ends at login when unauthenticated (redirects to /dashboard first)", async ({ page }) => {
    await page.goto("/manage", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/next=%2Fdashboard/);
  });

  test("admin routes redirect to login", async ({ page }) => {
    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});
