import { expect, test } from "@playwright/test";
import { measureActionMs, writePerfSnapshot } from "./helpers/perfReport";

test.describe("Auth / legacy manage redirect performance (mocked)", () => {
  /**
   * Unauthenticated GET /manage: Next redirects legacy path to /dashboard (next.config redirects),
   * then middleware sends unauthenticated users to /login?next=... Timings include that chain when using waitUntil: "domcontentloaded".
   */
  test.skip(process.env.PERF_USE_REAL_BACKEND === "1", "Mocked suite is skipped in real-backend mode.");

  test("login route and unauthenticated /manage → login emit audit findings", async ({ page }, testInfo) => {
    const loginLoadMs = await measureActionMs(async () => {
      await page.goto("/login", { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    });

    const redirectMs = await measureActionMs(async () => {
      await page.goto("/manage", { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(/\/login(\?|$)/);
    });

    const budgets = [
      {
        name: "login_route_load_ms",
        threshold: 1200,
        actual: loginLoadMs,
        pass: loginLoadMs < 1200,
      },
      {
        name: "legacy_manage_to_login_redirect_ms",
        threshold: 800,
        actual: redirectMs,
        pass: redirectMs < 800,
      },
    ];

    const findings: NonNullable<Parameters<typeof writePerfSnapshot>[1]["findings"]> = [];
    if (loginLoadMs > 1200) {
      findings.push({
        id: "slow_auth_route_load",
        title: "Auth route load exceeds threshold",
        impact: "medium",
        confidence: "medium",
        effort: "M",
        metricValue: Number(loginLoadMs.toFixed(2)),
        action: "defer non-critical auth route dependencies",
      });
    }
    if (redirectMs > 800) {
      findings.push({
        id: "slow_legacy_manage_auth_redirect",
        title: "Legacy /manage to login redirect exceeds threshold",
        impact: "medium",
        confidence: "high",
        effort: "S",
        metricValue: Number(redirectMs.toFixed(2)),
        action: "minimize middleware path work for unauthenticated dashboard/login redirects",
      });
    }
    if (findings.length === 0) {
      findings.push({
        id: "auth_legacy_manage_within_budget",
        title: "Auth route load and legacy manage redirect stay within budget",
        impact: "low",
        confidence: "high",
        effort: "S",
        metricValue: Number(Math.max(loginLoadMs, redirectMs).toFixed(2)),
        action: "keep auth and dashboard redirect dependencies stable to preserve current latency",
      });
    }

    await writePerfSnapshot(testInfo, {
      testName: testInfo.title,
      mode: "mocked",
      route: "/login -> GET /manage (308 -> /dashboard) -> middleware -> /login",
      auditPhase: "auth_manage",
      metrics: {
        loginLoadMs: Number(loginLoadMs.toFixed(2)),
        manageRedirectMs: Number(redirectMs.toFixed(2)),
      },
      budgets,
      requestCounts: {},
      findings,
      dataFlow: {
        phaseTimingsMs: {
          loginLoadMs: Number(loginLoadMs.toFixed(2)),
          manageRedirectMs: Number(redirectMs.toFixed(2)),
        },
      },
      notes: ["Mocked audit validates unauthenticated legacy /manage redirect path latency deterministically."],
    });

    expect(budgets.every((budget) => budget.pass)).toBeTruthy();
  });
});
