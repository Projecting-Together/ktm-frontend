import { expect, test } from "@playwright/test";
import { measureActionMs, writePerfSnapshot } from "./helpers/perfReport";

test.describe("Apartments performance (real backend report)", () => {
  test.skip(process.env.PERF_USE_REAL_BACKEND !== "1", "Real-backend suite only runs in PERF_USE_REAL_BACKEND=1 mode.");

  test("captures real backend page and filter timings", async ({ page }, testInfo) => {
    const listingRequests: string[] = [];
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.pathname.startsWith("/api/v1/listings")) {
        listingRequests.push(request.url());
      }
    });

    const loadMs = await measureActionMs(async () => {
      await page.goto("/listings", { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: /properties/i })).toBeVisible({ timeout: 30_000 });
      await expect(page.locator(".listing-card").first()).toBeVisible({ timeout: 30_000 });
    });

    const filterMs = await measureActionMs(async () => {
      await page.getByRole("button", { name: /^apartment$/i }).first().click();
      await page.waitForURL(/listing_type=apartment/, { timeout: 30_000 });
      await expect(page.locator(".listing-card").first()).toBeVisible({ timeout: 30_000 });
    });

    const findings = [
      {
        id: "real_backend_report_only",
        title: "Real backend metrics captured in report-only mode",
        impact: "medium" as const,
        confidence: "medium" as const,
        effort: "S" as const,
        metricValue: loadMs,
        action: "compare real-mode trends against mocked baseline before enforcing gate",
      },
    ];

    const snapshot = {
      testName: testInfo.title,
      mode: "real",
      route: "/listings",
      auditPhase: "search_flow" as const,
      metrics: {
        loadMs,
        filterMs,
      },
      budgets: [],
      requestCounts: {
        listingRequests: listingRequests.length,
      },
      notes: [
        "Real backend mode is report-only and does not enforce perf thresholds yet.",
      ],
      findings,
    };

    expect(snapshot.auditPhase).toBe("search_flow");
    expect(snapshot.mode).toBe("real");
    expect(snapshot.findings).toHaveLength(1);
    expect(snapshot.findings?.[0]?.id).toBe("real_backend_report_only");

    await writePerfSnapshot(testInfo, snapshot);
  });
});
