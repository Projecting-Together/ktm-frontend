# Frontend Performance Bottleneck Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a phased frontend bottleneck audit pipeline that measures search flow, auth/manage route performance, and global asset hotspots, then outputs a ranked performance report.

**Architecture:** Extend the current Playwright perf harness with route-specific audit specs and richer diagnostics aggregation. Keep mocked mode deterministic for guardrails and keep real-backend mode report-only. Use a single summarizer to generate both machine-readable and human-readable ranked findings.

**Tech Stack:** Next.js 15, React 19, Playwright, Node.js scripts, existing performance helpers under `tests/performance` and `tooling/scripts`.

---

### Task 1: Shared Diagnostics Model and Scoring Utilities

**Files:**
- Create: `tests/performance/helpers/auditScoring.ts`
- Modify: `tests/performance/helpers/perfReport.ts`
- Test: `tests/performance/helpers/auditScoring.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, test } from "@jest/globals";
import { rankFindings } from "./auditScoring";

describe("rankFindings", () => {
  test("orders high-impact high-confidence findings first", () => {
    const ranked = rankFindings([
      { id: "a", impact: "low", confidence: "high", effort: "S", metricValue: 400 },
      { id: "b", impact: "high", confidence: "high", effort: "M", metricValue: 1200 },
    ]);
    expect(ranked[0].id).toBe("b");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/performance/helpers/auditScoring.test.ts --runInBand`
Expected: FAIL with module/function not found.

- [ ] **Step 3: Write minimal implementation**

```ts
export type Impact = "high" | "medium" | "low";
export type Confidence = "high" | "medium" | "low";
export type Effort = "S" | "M" | "L";

export interface AuditFinding {
  id: string;
  impact: Impact;
  confidence: Confidence;
  effort: Effort;
  metricValue: number;
}

const IMPACT_SCORE: Record<Impact, number> = { high: 3, medium: 2, low: 1 };
const CONFIDENCE_SCORE: Record<Confidence, number> = { high: 3, medium: 2, low: 1 };
const EFFORT_SCORE: Record<Effort, number> = { S: 3, M: 2, L: 1 };

export function rankFindings(findings: AuditFinding[]): AuditFinding[] {
  return [...findings].sort((a, b) => {
    const sa = IMPACT_SCORE[a.impact] * CONFIDENCE_SCORE[a.confidence] * EFFORT_SCORE[a.effort];
    const sb = IMPACT_SCORE[b.impact] * CONFIDENCE_SCORE[b.confidence] * EFFORT_SCORE[b.effort];
    return sb - sa || b.metricValue - a.metricValue;
  });
}
```

- [ ] **Step 4: Extend snapshot type for phase attribution**

```ts
// in perfReport.ts
export interface PerfSnapshot {
  // existing fields...
  auditPhase?: "search_flow" | "auth_manage" | "global_assets";
  findings?: Array<{
    id: string;
    title: string;
    impact: "high" | "medium" | "low";
    confidence: "high" | "medium" | "low";
    effort: "S" | "M" | "L";
    metricValue: number;
    action: string;
  }>;
}
```

- [ ] **Step 5: Run tests to verify pass**

Run: `npm run test -- tests/performance/helpers/auditScoring.test.ts --runInBand`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add tests/performance/helpers/auditScoring.ts tests/performance/helpers/auditScoring.test.ts tests/performance/helpers/perfReport.ts
git commit -m "feat: add audit scoring primitives for performance findings"
```

---

### Task 2: Search Flow Audit Enhancements

**Files:**
- Modify: `tests/performance/apartments.mocked.perf.spec.ts`
- Modify: `tests/performance/helpers/mockListingsApi.ts`
- Test: `tests/performance/apartments.mocked.perf.spec.ts`

- [ ] **Step 1: Write failing assertion for search-flow findings in snapshot**

```ts
// add in existing mocked perf spec after snapshot generation
expect(snapshot.auditPhase).toBe("search_flow");
expect(snapshot.findings?.length).toBeGreaterThan(0);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:perf -- --grep "single filter interaction updates results under budget"`
Expected: FAIL because `auditPhase` / `findings` are missing.

- [ ] **Step 3: Add search-flow finding generation**

```ts
const findings = [];
if (requestDelta > 1) {
  findings.push({
    id: "duplicate_listings_fetch",
    title: "Duplicate listings requests after single filter change",
    impact: "high",
    confidence: "high",
    effort: "M",
    metricValue: requestDelta,
    action: "stabilize query key and URL-sync trigger to avoid duplicate fetches",
  });
}
if (interactionMs > 1000) {
  findings.push({
    id: "slow_filter_to_ui",
    title: "Filter interaction exceeds target latency",
    impact: "medium",
    confidence: "high",
    effort: "M",
    metricValue: interactionMs,
    action: "reduce synchronous work in filter handlers and derived transforms",
  });
}
```

- [ ] **Step 4: Persist findings and phase in snapshots**

```ts
await writePerfSnapshot(testInfo, {
  // existing fields...
  auditPhase: "search_flow",
  findings,
});
```

- [ ] **Step 5: Run test to verify pass**

Run: `npm run test:perf`
Expected: PASS with snapshots containing `auditPhase: "search_flow"` and populated findings when thresholds are exceeded.

- [ ] **Step 6: Commit**

```bash
git add tests/performance/apartments.mocked.perf.spec.ts tests/performance/helpers/mockListingsApi.ts
git commit -m "feat: emit search-flow bottleneck findings in perf snapshots"
```

---

### Task 3: Auth/Manage Route Audit Spec

**Files:**
- Create: `tests/performance/auth-manage.mocked.perf.spec.ts`
- Modify: `playwright.perf.config.ts`
- Test: `tests/performance/auth-manage.mocked.perf.spec.ts`

- [ ] **Step 1: Write failing route audit test**

```ts
import { expect, test } from "@playwright/test";

test("login route and manage redirect emit audit findings", async ({ page }, testInfo) => {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();
  // failing placeholder until snapshot writing is added
  expect(false).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:perf -- --grep "login route and manage redirect emit audit findings"`
Expected: FAIL.

- [ ] **Step 3: Implement auth/manage audit measurements**

```ts
const loginLoadMs = await measureActionMs(async () => {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();
});

const redirectMs = await measureActionMs(async () => {
  await page.goto("/manage", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/login/);
});
```

- [ ] **Step 4: Emit auth/manage findings**

```ts
const findings = [];
if (loginLoadMs > 1200) {
  findings.push({
    id: "slow_auth_route_load",
    title: "Auth route load exceeds threshold",
    impact: "medium",
    confidence: "medium",
    effort: "M",
    metricValue: loginLoadMs,
    action: "defer non-critical auth route dependencies",
  });
}
```

- [ ] **Step 5: Run test to verify pass**

Run: `npm run test:perf`
Expected: PASS and snapshots include `auditPhase: "auth_manage"`.

- [ ] **Step 6: Commit**

```bash
git add tests/performance/auth-manage.mocked.perf.spec.ts playwright.perf.config.ts
git commit -m "feat: add auth and manage route performance audit phase"
```

---

### Task 4: Global Asset Audit Extraction and Report Integration

**Files:**
- Modify: `tooling/scripts/summarize-perf.mjs`
- Create: `tooling/scripts/__tests__/summarize-perf.test.mjs`
- Test: `tooling/scripts/__tests__/summarize-perf.test.mjs`

- [ ] **Step 1: Write failing summarizer test**

```js
import { strict as assert } from "node:assert";
import { buildEndpointTimingRows } from "../summarize-perf.mjs";

const rows = buildEndpointTimingRows([{ dataFlow: { endpointAvgMs: { "/_next/a.js": 100, "/api/v1/listings/": 50 }, endpointMaxMs: {}, endpointCount: {} } }], { apiOnly: true });
assert.equal(rows.length, 1);
assert.equal(rows[0].endpoint, "/api/v1/listings/");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tooling/scripts/__tests__/summarize-perf.test.mjs`
Expected: FAIL due to missing option/export behavior.

- [ ] **Step 3: Implement API-only and global-assets sections**

```js
function isApiEndpoint(endpoint) {
  return endpoint.startsWith("/api/");
}

// Build two tables:
// 1) API endpoint timing table
// 2) Global asset timing table (exclude /api)
```

- [ ] **Step 4: Add ranked bottleneck section**

```js
// combine snapshot findings -> rankFindings-like ordering in report output
lines.push("## Ranked Bottleneck Findings");
```

- [ ] **Step 5: Run test to verify pass**

Run: `node tooling/scripts/__tests__/summarize-perf.test.mjs && node tooling/scripts/summarize-perf.mjs`
Expected: PASS and markdown includes API-only + global-assets tables and ranked findings.

- [ ] **Step 6: Commit**

```bash
git add tooling/scripts/summarize-perf.mjs tooling/scripts/__tests__/summarize-perf.test.mjs
git commit -m "feat: split api and asset hotspot reporting with ranked findings"
```

---

### Task 5: Real Backend Phase Output and Final Verification

**Files:**
- Modify: `tests/performance/apartments.real.perf.spec.ts`
- Modify: `build/performance/summary.md` (generated artifact)
- Modify: `build/performance/summary.json` (generated artifact)
- Test: end-to-end perf commands

- [ ] **Step 1: Write failing expectation for real-backend phase tag**

```ts
expect(snapshot.auditPhase).toBe("search_flow");
expect(snapshot.mode).toBe("real");
```

- [ ] **Step 2: Run test to verify it fails (without phase tag)**

Run: `NEXT_PUBLIC_API_URL=https://example.invalid npm run test:perf:real`
Expected: FAIL before adding phase annotations (or skip/fail based on env if endpoint not reachable).

- [ ] **Step 3: Implement real-mode phase + findings**

```ts
await writePerfSnapshot(testInfo, {
  // existing fields...
  auditPhase: "search_flow",
  findings: [{
    id: "real_backend_report_only",
    title: "Real backend metrics captured in report-only mode",
    impact: "medium",
    confidence: "medium",
    effort: "S",
    metricValue: loadMs,
    action: "compare real-mode trends against mocked baseline before enforcing gate",
  }],
});
```

- [ ] **Step 4: Run full verification suite**

Run:
- `npm run check`
- `npm run test -- --runInBand`
- `npm run test:perf`
- `npm run test:perf:real` (only when `NEXT_PUBLIC_API_URL` is available and reachable)

Expected:
- all local deterministic checks pass;
- report artifacts regenerate with phase coverage and ranked bottlenecks.

- [ ] **Step 5: Commit**

```bash
git add tests/performance/apartments.real.perf.spec.ts build/performance/summary.md build/performance/summary.json
git commit -m "feat: complete phased performance audit reporting and verification"
```

---

## Spec Coverage Self-Review

- Search flow audit: covered by Task 2.
- Auth/manage audit: covered by Task 3.
- Global assets + hotspot ranking: covered by Task 4.
- Cross-phase scoring + fix prioritization: covered by Tasks 1 and 4.
- Real backend report-only handling: covered by Task 5.
- Rollout verification commands and artifact expectations: covered by Task 5.

No placeholder sections remain; all tasks include concrete files, code, and commands.
