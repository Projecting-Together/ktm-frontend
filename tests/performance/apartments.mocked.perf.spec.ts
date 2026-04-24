import { expect, test } from "@playwright/test";
import { buildSearchFlowFindings, installListingsMocks } from "./helpers/mockListingsApi";
import { measureActionMs, writePerfSnapshot } from "./helpers/perfReport";

test.describe("Apartments performance (mocked)", () => {
  test.skip(process.env.PERF_USE_REAL_BACKEND === "1", "Mocked suite is skipped in real-backend mode.");

  test("initial apartments load stays under budget", async ({ page }, testInfo) => {
    const requests = await installListingsMocks(page, { totalItems: 60, delayMs: 100 });

    const phaseStartedAt = performance.now();
    const loadMs = await measureActionMs(async () => {
      await page.goto("/apartments", { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: /properties/i })).toBeVisible();
      await expect(page.locator(".listing-card").first()).toBeVisible();
    });
    const phaseLoadToReadyMs = performance.now() - phaseStartedAt;

    const listingRequestCount = requests.getCount("/api/v1/listings");
    const budgets = [
      { name: "initial_load_ms", threshold: 3000, actual: loadMs, pass: loadMs < 3000 },
      {
        name: "listings_request_count",
        threshold: 1,
        actual: listingRequestCount,
        pass: listingRequestCount <= 1,
      },
    ];
    const findings = buildSearchFlowFindings({
      initialLoadMs: loadMs,
      listingsRequestCount: listingRequestCount,
    });

    await writePerfSnapshot(testInfo, {
      testName: testInfo.title,
      mode: "mocked",
      route: "/apartments",
      auditPhase: "search_flow",
      metrics: { loadMs },
      budgets,
      requestCounts: { listings: listingRequestCount },
      findings,
      dataFlow: {
        endpointAvgMs: requests.getEndpointAveragesMs(),
        endpointMaxMs: requests.getEndpointMaxMs(),
        endpointCount: requests.getEndpointCounts(),
        duplicateRequestKeys: requests.getDuplicateRequestKeys(),
        phaseTimingsMs: {
          loadToReadyMs: Number(phaseLoadToReadyMs.toFixed(2)),
        },
      },
    });

    expect(budgets.every((budget) => budget.pass)).toBeTruthy();
  });

  test("single filter interaction updates results under budget", async ({ page }, testInfo) => {
    const requests = await installListingsMocks(page, { totalItems: 80, delayMs: 120 });

    await page.goto("/apartments", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: /^apartment$/i }).first()).toBeVisible();

    const beforeFilter = requests.getCount("/api/v1/listings");
    const interactionStart = performance.now();
    let urlUpdatedMs = 0;
    let responseSettledMs = 0;
    const interactionMs = await measureActionMs(async () => {
      await page.getByRole("button", { name: /^apartment$/i }).first().click();
      await page.waitForURL(/listing_type=apartment/);
      urlUpdatedMs = performance.now() - interactionStart;
      await expect(page.locator(".listing-card").first()).toBeVisible();
    });
    const uiUpdatedMs = interactionMs;
    const endpointAvgMs = requests.getEndpointAveragesMs();
    const listingsAvgMs = endpointAvgMs["/api/v1/listings"] ?? 0;
    responseSettledMs = Math.min(uiUpdatedMs, urlUpdatedMs + listingsAvgMs);
    const afterFilter = requests.getCount("/api/v1/listings");
    const requestDelta = afterFilter - beforeFilter;

    const budgets = [
      {
        name: "filter_interaction_ms",
        threshold: 1000,
        actual: interactionMs,
        pass: interactionMs < 1000,
      },
      {
        name: "listings_requests_per_filter_change",
        threshold: 2,
        actual: requestDelta,
        pass: requestDelta <= 2,
      },
    ];
    const findings = buildSearchFlowFindings({
      filterInteractionMs: interactionMs,
      listingsRequestsPerFilterChange: requestDelta,
    });

    await writePerfSnapshot(testInfo, {
      testName: testInfo.title,
      mode: "mocked",
      route: "/apartments",
      auditPhase: "search_flow",
      metrics: { interactionMs },
      budgets,
      requestCounts: { listingsDelta: requestDelta, listingsTotal: afterFilter },
      findings,
      dataFlow: {
        endpointAvgMs,
        endpointMaxMs: requests.getEndpointMaxMs(),
        endpointCount: requests.getEndpointCounts(),
        duplicateRequestKeys: requests.getDuplicateRequestKeys(),
        phaseTimingsMs: {
          interactionToUrlUpdateMs: Number(urlUpdatedMs.toFixed(2)),
          urlUpdateToResponseMs: Number(Math.max(0, responseSettledMs - urlUpdatedMs).toFixed(2)),
          responseToUiUpdateMs: Number(Math.max(0, uiUpdatedMs - responseSettledMs).toFixed(2)),
        },
      },
    });

    expect(budgets.every((budget) => budget.pass)).toBeTruthy();
  });

  test("slow API keeps loading feedback visible", async ({ page }, testInfo) => {
    const requests = await installListingsMocks(page, { totalItems: 30, delayMs: 8000 });

    await page.goto("/apartments", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/still loading/i)).toBeVisible({ timeout: 10_000 });

    const heading = page.getByRole("heading", { name: /properties/i });
    await expect(heading).toBeVisible({ timeout: 15_000 });

    await writePerfSnapshot(testInfo, {
      testName: testInfo.title,
      mode: "mocked",
      route: "/apartments",
      auditPhase: "search_flow",
      metrics: { delayedResponseMs: 8000 },
      budgets: [{ name: "slow_loading_hint_visible", threshold: 1, actual: 1, pass: true }],
      requestCounts: {},
      dataFlow: {
        endpointAvgMs: requests.getEndpointAveragesMs(),
        endpointMaxMs: requests.getEndpointMaxMs(),
        endpointCount: requests.getEndpointCounts(),
        duplicateRequestKeys: requests.getDuplicateRequestKeys(),
      },
      notes: ["Slow API simulation confirms user-facing loading hint appears."],
    });
  });

  test("large dataset render stays within report budget", async ({ page }, testInfo) => {
    const requests = await installListingsMocks(page, { totalItems: 400, delayMs: 100 });

    const renderMs = await measureActionMs(async () => {
      await page.goto("/apartments", { waitUntil: "domcontentloaded" });
      await expect(page.locator(".listing-card").first()).toBeVisible();
    });

    const budget = { name: "large_dataset_render_ms", threshold: 5000, actual: renderMs, pass: renderMs < 5000 };

    await writePerfSnapshot(testInfo, {
      testName: testInfo.title,
      mode: "mocked",
      route: "/apartments",
      auditPhase: "search_flow",
      metrics: { renderMs, records: 400 },
      budgets: [budget],
      requestCounts: {},
      dataFlow: {
        endpointAvgMs: requests.getEndpointAveragesMs(),
        endpointMaxMs: requests.getEndpointMaxMs(),
        endpointCount: requests.getEndpointCounts(),
        duplicateRequestKeys: requests.getDuplicateRequestKeys(),
      },
      notes: budget.pass ? [] : ["Large dataset exceeded report budget; consider virtualization or skeleton strategy."],
    });

    expect(budget.pass).toBeTruthy();
  });
});
