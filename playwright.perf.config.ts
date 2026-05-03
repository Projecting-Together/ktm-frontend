import nextEnv from "@next/env";
import { defineConfig, devices } from "@playwright/test";

/** Same env loading as Next.js / E2E Playwright so `.env` / `.env.local` apply to perf runs. */
nextEnv.loadEnvConfig(process.cwd());

/**
 * Performance Playwright config — see also `playwright.config.ts` (E2E).
 * - baseURL: perf uses PLAYWRIGHT_PERF_PORT (default 4190); E2E uses PLAYWRIGHT_E2E_PORT (default 4188). Different ports avoid colliding dev servers; both load `.env` via `nextEnv.loadEnvConfig` (same pattern as E2E).
 * - PERF_USE_REAL_BACKEND=1: skips mocked perf specs (see *.perf.spec.ts `test.skip`), sets NEXT_PUBLIC_USE_MSW default false, allows service workers.
 * - NEXT_PUBLIC_API_URL: defaults to same-site `${perfOrigin}/api/v1` like E2E’s mswApiUrl pattern.
 */
const perfPort = process.env.PLAYWRIGHT_PERF_PORT ?? "4190";
const perfOrigin = `http://localhost:${perfPort}`;
const realBackendMode = process.env.PERF_USE_REAL_BACKEND === "1";

export default defineConfig({
  testDir: "./tests/performance",
  testMatch: "**/*.perf.spec.ts",
  outputDir: "build/performance/test-results",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ["list"],
    ["json", { outputFile: "build/performance/playwright-results.json" }],
    ["html", { outputFolder: "build/performance/playwright-report", open: "never" }],
  ],
  use: {
    ...devices["Desktop Chrome"],
    baseURL: perfOrigin,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    serviceWorkers: realBackendMode ? "allow" : "block",
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },
  timeout: 60_000,
  webServer: {
    command: `npx next build && npx next start -p ${perfPort}`,
    url: perfOrigin,
    reuseExistingServer: false,
    timeout: 300_000,
    env: {
      CI: process.env.CI ?? "1",
      NEXT_PUBLIC_USE_MSW: process.env.NEXT_PUBLIC_USE_MSW ?? (realBackendMode ? "false" : "true"),
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? `${perfOrigin}/api/v1`,
    },
  },
});
