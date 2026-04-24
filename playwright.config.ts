import { defineConfig, devices } from "@playwright/test";

/** Dedicated dev port for e2e (avoids :3000 and stale checkouts). Override if busy: PLAYWRIGHT_E2E_PORT=4199 */
const e2ePort = process.env.PLAYWRIGHT_E2E_PORT ?? "4188";
const e2eOrigin = `http://localhost:${e2ePort}`;
const useNextDev = process.env.PLAYWRIGHT_USE_NEXT_DEV === "1";
const webServerCommand = useNextDev
  ? `npx next dev -p ${e2ePort}`
  : `npx next build && npx next start -p ${e2ePort}`;
/** Browser MSW for deterministic listings data (see `MswGate` + `src/msw/handlers.ts`). */
// Keep the mock API origin same-site with the Next app so if MSW fails to start, the browser
// won’t fall into a cross-origin CORS failure mode that masks the real issue.
const mswApiUrl = process.env.PLAYWRIGHT_MSW_API_URL ?? `${e2eOrigin}/api/v1`;
const enableMsw = process.env.PLAYWRIGHT_MSW !== "0";

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "build/test-results",
  fullyParallel: false, // sequential in sandbox to avoid resource contention
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // 1 retry locally to handle flakiness
  workers: 1, // single worker — sandbox has limited resources
  reporter: [
    ["html", { outputFolder: "build/playwright-report", open: "never" }],
    ["list"],
  ],
  use: {
    baseURL: e2eOrigin,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
    // Generous timeouts for sandbox dev server
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  timeout: 45_000, // per-test timeout
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "Mobile Chrome", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: webServerCommand,
    url: e2eOrigin,
    // Always start this worktree’s app; avoids stale routes from another checkout on :3000.
    reuseExistingServer: false,
    timeout: useNextDev ? 120_000 : 300_000,
    env: {
      // IMPORTANT: do not `...process.env` here — it can accidentally *disable* MSW if the user has
      // `NEXT_PUBLIC_USE_MSW` unset in the shell, overriding our defaults below (object spread order would lose).
      CI: process.env.CI ?? "1",
      // Ensure Playwright does not depend on a live backend; MSW runs in the browser and intercepts
      // fetches to `NEXT_PUBLIC_API_URL`.
      NEXT_PUBLIC_USE_MSW: (process.env.NEXT_PUBLIC_USE_MSW ?? (enableMsw ? "true" : "false")) as string,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? mswApiUrl,
    },
  },
});
