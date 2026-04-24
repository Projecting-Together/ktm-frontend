import { spawn } from "node:child_process";

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.error("NEXT_PUBLIC_API_URL is required for test:perf:real");
  process.exit(1);
}

const child = spawn(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["playwright", "test", "-c", "playwright.perf.config.ts"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      PERF_USE_REAL_BACKEND: "1",
      NEXT_PUBLIC_USE_MSW: "false",
    },
  },
);

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
