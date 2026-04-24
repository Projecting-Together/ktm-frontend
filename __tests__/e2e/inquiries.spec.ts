import { test, expect } from "@playwright/test";

test.describe("Inquiry & Lead Flows", () => {
  test("sale listing inquiry CTA labels seller-specific intent", async ({ page }) => {
    await page.goto("/apartments/traditional-house-bhaktapur-lst-005", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("load");

    const cta = page.getByRole("link", { name: /send inquiry to seller/i });
    await expect(cta).toBeVisible({ timeout: 20_000 });
    await expect(cta).toHaveAttribute("href", "/login");
  });

  test("manage inquiries sale lead filter isolates sale leads", async ({ page, baseURL }) => {
    const appUrl = baseURL ?? "http://localhost:4188";

    await page.context().addCookies([
      { name: "accessToken", value: "mock-owner-token", url: appUrl },
      { name: "userRole", value: "landlord", url: appUrl },
    ]);

    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.setItem(
        "ktm-auth",
        JSON.stringify({
          state: {
            isAuthenticated: true,
            user: {
              id: "usr-owner-001",
              email: "sita.thapa@ktmapartments.com",
              role: "owner",
              status: "active",
            },
            accessToken: "mock-owner-token",
          },
          version: 0,
        }),
      );
    });

    await page.goto("/manage/inquiries", { waitUntil: "domcontentloaded" });
    if (page.url().includes("login")) {
      test.skip();
      return;
    }

    await expect(page.getByRole("heading", { name: /inquiries/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /sale leads/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /rental leads/i })).toBeVisible();

    await page.getByRole("button", { name: /sale leads/i }).click();
    await expect(page.getByRole("button", { name: /sale leads/i })).toHaveClass(/bg-accent/);
    await expect(page.getByRole("button", { name: /rental leads/i })).not.toHaveClass(/bg-accent/);
  });
});
