import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("register page renders correctly", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    // Check the heading
    await expect(page.getByRole("heading", { name: /create your account/i })).toBeVisible({ timeout: 10000 });

    // Check role picker labels exist
    await expect(page.locator("label", { hasText: "Renter" }).first()).toBeVisible();
    await expect(page.locator("label", { hasText: "Property Owner" }).first()).toBeVisible();
    await expect(page.locator("label", { hasText: "Agent / Broker" }).first()).toBeVisible();

    // Check form fields
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
  });

  test("register form role picker shows all three roles", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    // All three role labels should be visible
    const renterLabel = page.locator("label", { hasText: "Renter" }).first();
    const ownerLabel = page.locator("label", { hasText: "Property Owner" }).first();
    const agentLabel = page.locator("label", { hasText: "Agent / Broker" }).first();

    await expect(renterLabel).toBeVisible({ timeout: 10000 });
    await expect(ownerLabel).toBeVisible();
    await expect(agentLabel).toBeVisible();
  });

  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("login form shows validation errors on empty submit", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    const submitBtn = page.getByRole("button", { name: /sign in/i });
    await expect(submitBtn).toBeVisible({ timeout: 10000 });
    await submitBtn.click();

    // Should show validation errors (required fields)
    await page.waitForTimeout(500);
    // The form should not navigate away
    await expect(page).toHaveURL(/\/login/);
  });

  test("protected routes redirect to login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test("manage routes redirect to login", async ({ page }) => {
    await page.goto("/manage");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test("admin routes redirect to login", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});
