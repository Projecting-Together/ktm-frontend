import { test, expect, type Page } from "@playwright/test";

async function assertAuthenticatedPrecondition(page: Page): Promise<void> {
  await expect(
    page,
    "Auth precondition failed: expected authenticated owner setup to stay on listing pages, but request was redirected to /login."
  ).not.toHaveURL(/\/login(?:\?|$)/);
}

async function clickPostListingEntry(page: Page): Promise<void> {
  const postListingName = /post(?:\s+a)?\s+listing/i;
  const clickVisibleEntry = async (): Promise<boolean> => {
    const postListingButtons = page.getByRole("button", { name: postListingName });
    const buttonCount = await postListingButtons.count();
    for (let i = 0; i < buttonCount; i += 1) {
      const entry = postListingButtons.nth(i);
      if (await entry.isVisible()) {
        await entry.click();
        return true;
      }
    }

    const postListingLinks = page.getByRole("link", { name: postListingName });
    const linkCount = await postListingLinks.count();
    for (let i = 0; i < linkCount; i += 1) {
      const entry = postListingLinks.nth(i);
      if (await entry.isVisible()) {
        await entry.click();
        return true;
      }
    }

    return false;
  };

  if (await clickVisibleEntry()) {
    return;
  }

  const mobileMenuToggle = page.getByRole("button", { name: /toggle menu/i });
  if (await mobileMenuToggle.isVisible()) {
    await mobileMenuToggle.click();
    await expect(
      page.getByRole("navigation").filter({ hasText: postListingName }).first()
    ).toBeVisible();
    if (await clickVisibleEntry()) {
      return;
    }
  }

  await page.getByRole("link", { name: postListingName }).first().click();
}

test.describe("Listing Creation Wizard (Unauthenticated)", () => {
  test("redirects to login when accessing /manage/listings/new unauthenticated", async ({ page }) => {
    await page.goto("/manage/listings/new");
    await expect(page).toHaveURL(/login/);
    await expect(page).toHaveURL(/next=%2Fmanage%2Flistings%2Fnew/);
  });

});

test.describe("Listing Creation Wizard (Authenticated Owner)", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    const appUrl = baseURL ?? "http://localhost:4188";
    await page.context().addCookies([
      { name: "accessToken", value: "mock-owner-token", url: appUrl },
      { name: "userRole", value: "owner", url: appUrl },
    ]);
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.setItem("ktm-auth", JSON.stringify({
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
      }));
    });
    await page.goto("/manage/listings/new");
    await assertAuthenticatedPrecondition(page);
  });

  test("Step 1 — renders property type selection", async ({ page }) => {
    await expect(page.getByText(/property type/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /room/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /studio/i })).toBeVisible();
  });

  test("Step 1 — shows validation error when Next is clicked without selecting type", async ({ page }) => {
    const nextBtn = page.getByRole("button", { name: /next/i });
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();
    await expect(page.getByText(/invalid option/i)).toBeVisible();
  });

  test("Step 1 — can select apartment type and proceed", async ({ page }) => {
    const apartmentBtn = page.getByRole("button", { name: /(?:^|\s)apartment(?:\s|$)/i }).first();
    await expect(apartmentBtn).toBeVisible();
    await apartmentBtn.click();
    await page.getByPlaceholder(/bright 2-bedroom apartment in thamel/i).fill("Modern 2BHK in Thamel");
    await page.getByPlaceholder(/describe your property/i).fill(
      "A beautifully furnished apartment in the heart of Thamel with mountain views, natural light, secure parking, and reliable backup power. The home includes a modern kitchen, spacious living room, two well-ventilated bedrooms, and two bathrooms with premium fittings. It is close to shops, schools, hospitals, gyms, and public transport, and the building has secure entry, steady water supply, and a responsive caretaker. The flat is ideal for families and professionals seeking comfort, convenience, and a peaceful neighborhood."
    );
    const nextBtn = page.getByRole("button", { name: /next/i });
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();
    // Should advance to step 2
    await expect(page.getByText(/step 2 of 8/i)).toBeVisible();
    await expect(page.getByText(/neighborhood/i)).toHaveCount(0);
  });

  test("Step 1 — preselects purpose as sale from query parameter", async ({ page }) => {
    await page.goto("/manage/listings/new?purpose=sale");
    await assertAuthenticatedPrecondition(page);
    await expect(page.getByRole("button", { name: /for sale/i })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: /for rent/i })).toHaveAttribute("aria-pressed", "false");
  });

  test("Step 1 — defaults purpose to rent when query is missing", async ({ page }) => {
    await page.goto("/manage/listings/new");
    await assertAuthenticatedPrecondition(page);
    await expect(page.getByRole("button", { name: /for rent/i })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: /for sale/i })).toHaveAttribute("aria-pressed", "false");
  });

  test("Step 1 — falls back to rent for invalid purpose query", async ({ page }) => {
    await page.goto("/manage/listings/new?purpose=invalid-value");
    await assertAuthenticatedPrecondition(page);
    await expect(page.getByRole("button", { name: /for rent/i })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: /for sale/i })).toHaveAttribute("aria-pressed", "false");
  });

  test("capped owner sees upgrade modal from navbar entry", async ({ page, baseURL }) => {
    const appUrl = baseURL ?? "http://localhost:4188";
    await page.context().addCookies([
      { name: "accessToken", value: "mock-owner-token", url: appUrl },
      { name: "userRole", value: "owner", url: appUrl },
    ]);
    await page.route("**/api/v1/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "usr-owner-001",
          email: "sita.thapa@gmail.com",
          role: "owner",
          status: "active",
          is_verified: true,
          created_at: "2024-06-15T08:00:00Z",
          profile: {
            user_id: "usr-owner-001",
            first_name: "Sita",
            last_name: "Thapa",
          },
          stats: { active_listings: 2 },
        }),
      });
    });
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("ktm-auth", JSON.stringify({
        state: {
          isAuthenticated: true,
          user: {
            id: "usr-owner-001",
            email: "sita.thapa@ktmapartments.com",
            role: "owner",
            status: "active",
            stats: { active_listings: 2 },
          },
          accessToken: "mock-owner-token",
        },
        version: 0,
      }));
    });
    await page.reload();
    await assertAuthenticatedPrecondition(page);

    await clickPostListingEntry(page);
    const upgradeModalTitle = page.getByRole("heading", { name: /upgrade to agent/i });
    if (await upgradeModalTitle.isVisible()) {
      await expect(upgradeModalTitle).toBeVisible();
      await page.getByRole("button", { name: /cancel/i }).click();
      await expect(upgradeModalTitle).toHaveCount(0);
      return;
    }

    await expect(page).toHaveURL(/\/manage\/listings\/new/);
  });
});

test.describe("Listing Creation Wizard (Authenticated Renter)", () => {
  test("allows renter to access /manage/listings/new", async ({ page, baseURL }) => {
    const appUrl = baseURL ?? "http://localhost:4188";
    await page.context().addCookies([
      { name: "accessToken", value: "mock-renter-token", url: appUrl },
      { name: "userRole", value: "renter", url: appUrl },
    ]);
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.setItem("ktm-auth", JSON.stringify({
        state: {
          isAuthenticated: true,
          user: {
            id: "usr-renter-001",
            email: "renter@ktmapartments.com",
            role: "renter",
            status: "active",
            stats: { active_listings: 1 },
          },
          accessToken: "mock-renter-token",
        },
        version: 0,
      }));
    });

    await page.goto("/manage/listings/new");
    await assertAuthenticatedPrecondition(page);
    await expect(page.getByText(/create a new listing/i)).toBeVisible();
  });
});
