import { readdir } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.cwd();
const TESTS_ROOT = join(ROOT, "tests");
const violations = [];

const isJestTestFile = (filePath) => /\.test\.(ts|tsx)$/.test(filePath);
const isPlaywrightSpecFile = (filePath) => /\.spec\.ts$/.test(filePath);
const isPerfPlaywrightSpecFile = (filePath) => /\.perf\.spec\.ts$/.test(filePath);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const normalized = fullPath.replaceAll("\\", "/");

    if (
      (normalized.includes("/tests/performance/") || normalized.includes("/tests/e2e/")) &&
      isJestTestFile(normalized)
    ) {
      violations.push(`Jest-style test found in Playwright suite: ${normalized}`);
    }

    if (
      (normalized.includes("/tests/unit/") || normalized.includes("/tests/integration/")) &&
      isPlaywrightSpecFile(normalized)
    ) {
      violations.push(`Playwright-style spec found in Jest suite: ${normalized}`);
    }

    if (
      normalized.includes("/tests/performance/") &&
      isPlaywrightSpecFile(normalized) &&
      !isPerfPlaywrightSpecFile(normalized)
    ) {
      violations.push(`Performance specs must use *.perf.spec.ts naming: ${normalized}`);
    }
  }
}

async function main() {
  await walk(TESTS_ROOT);

  if (violations.length > 0) {
    console.error("Test boundary violations found:");
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }
    process.exit(1);
  }

  console.log("Test boundary validation passed.");
}

main().catch((error) => {
  console.error("Boundary validation failed unexpectedly.");
  console.error(error);
  process.exit(1);
});
