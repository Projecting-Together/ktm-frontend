import { spawn } from "node:child_process";
import process from "node:process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextBinPath = require.resolve("next/dist/bin/next");
const port = process.env.PORT ?? "3000";
const host = process.env.HOST ?? "0.0.0.0";

const child = spawn(process.execPath, [nextBinPath, "start", "-p", port, "-H", host], {
  stdio: "inherit",
  env: process.env,
});

child.on("error", (error) => {
  console.error("Failed to start Next.js server:", error);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
