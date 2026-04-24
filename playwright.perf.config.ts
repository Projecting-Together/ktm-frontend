import { defineConfig, devices } from "@playwright/test";

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
