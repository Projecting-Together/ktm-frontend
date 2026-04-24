import { expect, test } from "@playwright/test";
import { measureActionMs, writePerfSnapshot } from "./helpers/perfReport";

test.describe("Auth/manage performance (mocked)", () => {
  test.skip(process.env.PERF_USE_REAL_BACKEND === "1", "Mocked suite is skipped in real-backend mode.");

  test("login route and manage redirect emit audit findings", async ({ page }, testInfo) => {
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
        name: "manage_redirect_ms",
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
        id: "slow_manage_auth_redirect",
        title: "Manage-to-login redirect exceeds threshold",
        impact: "medium",
        confidence: "high",
        effort: "S",
        metricValue: Number(redirectMs.toFixed(2)),
        action: "minimize middleware path work for unauthenticated manage redirects",
      });
    }
    if (findings.length === 0) {
      findings.push({
        id: "auth_manage_within_budget",
        title: "Auth route load and manage redirect stay within budget",
        impact: "low",
        confidence: "high",
        effort: "S",
        metricValue: Number(Math.max(loginLoadMs, redirectMs).toFixed(2)),
        action: "keep auth/manage route dependencies stable to preserve current latency",
      });
    }

    await writePerfSnapshot(testInfo, {
      testName: testInfo.title,
      mode: "mocked",
      route: "/login -> /manage",
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
      notes: ["Mocked auth/manage audit validates unauthenticated redirect path latency deterministically."],
    });

    expect(budgets.every((budget) => budget.pass)).toBeTruthy();
  });
});
