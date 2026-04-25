import { expect, test } from "@playwright/test";
import { installListingsMocks, buildSearchFlowFindings } from "./helpers/mockListingsApi";
import { measureActionMs, writePerfSnapshot } from "./helpers/perfReport";

test.describe("Public home ISR (mocked perf)", () => {
  test.skip(process.env.PERF_USE_REAL_BACKEND === "1", "Mocked suite is skipped in real-backend mode.");

  test("home loads within budget (ISR route under perf harness)", async ({ page }, testInfo) => {
    const requests = await installListingsMocks(page, { totalItems: 16, delayMs: 35 });

    const firstMs = await measureActionMs(async () => {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await expect(
        page.getByRole("heading", { name: /Find Your Perfect Home in\s*Kathmandu/i })
      ).toBeVisible({ timeout: 25_000 });
    });

    const secondMs = await measureActionMs(async () => {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await expect(
        page.getByRole("heading", { name: /Find Your Perfect Home in\s*Kathmandu/i })
      ).toBeVisible({ timeout: 25_000 });
    });

    const listingsHits = requests.getCount("/api/v1/listings");
    const budgets = [
      { name: "first_navigation_ms", threshold: 12_000, actual: firstMs, pass: firstMs < 12_000 },
      { name: "repeat_navigation_ms", threshold: 12_000, actual: secondMs, pass: secondMs < 12_000 },
    ];

    const findings = buildSearchFlowFindings({
      initialLoadMs: firstMs,
      listingsRequestCount: listingsHits,
    });

    await writePerfSnapshot(testInfo, {
      testName: testInfo.title,
      mode: "mocked",
      route: "/",
      auditPhase: "search_flow",
      metrics: { firstMs, secondMs },
      budgets,
      requestCounts: { listings: listingsHits },
      findings,
      notes: [
        "Wave 3 VERIFY-02 baseline: home uses ISR (revalidate=300) with tagged fetch when Wave 1 code present; repeat navigation exercises Data Cache / browser cache interaction under mocked API.",
      ],
      dataFlow: {
        endpointAvgMs: requests.getEndpointAveragesMs(),
        endpointMaxMs: requests.getEndpointMaxMs(),
        endpointCount: requests.getEndpointCounts(),
        duplicateRequestKeys: requests.getDuplicateRequestKeys(),
      },
    });

    expect(budgets.every((b) => b.pass)).toBeTruthy();
  });
});
