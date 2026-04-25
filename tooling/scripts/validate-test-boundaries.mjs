import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const TESTS_ROOT = join(ROOT, "tests");

const isJestTestFile = (filePath) => /\.test\.(ts|tsx)$/.test(filePath);
const isPlaywrightSpecFile = (filePath) => /\.spec\.ts$/.test(filePath);
const isPerfPlaywrightSpecFile = (filePath) => /\.perf\.spec\.ts$/.test(filePath);

export function validateTestFilePath(filePath) {
  const violations = [];

  if (
    (filePath.includes("/tests/performance/") || filePath.includes("/tests/e2e/")) &&
    isJestTestFile(filePath)
  ) {
    violations.push(`Jest-style test found in Playwright suite: ${filePath}`);
  }

  if (
    (filePath.includes("/tests/unit/") || filePath.includes("/tests/integration/")) &&
    isPlaywrightSpecFile(filePath)
  ) {
    violations.push(`Playwright-style spec found in Jest suite: ${filePath}`);
  }

  if (
    filePath.includes("/tests/performance/") &&
    isPlaywrightSpecFile(filePath) &&
    !isPerfPlaywrightSpecFile(filePath)
  ) {
    violations.push(`Performance specs must use *.perf.spec.ts naming: ${filePath}`);
  }

  return violations;
}

async function walk(dir, violations) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath, violations);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const normalized = fullPath.replaceAll("\\", "/");
    violations.push(...validateTestFilePath(normalized));
  }
}

async function main() {
  const violations = [];
  await walk(TESTS_ROOT, violations);

  if (violations.length > 0) {
    console.error("Test boundary violations found:");
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }
    process.exit(1);
  }

  console.log("Test boundary validation passed.");
}

function isCliInvocation() {
  if (!process.argv[1]) {
    return false;
  }

  return import.meta.url === pathToFileURL(process.argv[1]).href;
}

if (isCliInvocation()) {
  main().catch((error) => {
    console.error("Boundary validation failed unexpectedly.");
    console.error(error);
    process.exit(1);
  });
}
