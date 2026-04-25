# Frontend Testing Architecture Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split Jest and Playwright responsibilities cleanly, harden `jest.config.ts`, and add test-boundary guardrails so testing is more stable, faster to run, and easier to maintain.

**Architecture:** Keep Jest focused on `unit` + `integration` only, and keep Playwright focused on `e2e` + `performance`. Add explicit npm scripts and a boundary validation script that prevents cross-suite leakage. Document suite ownership and naming rules so contributors can follow one source of truth.

**Tech Stack:** Next.js 15, Jest, Playwright, Node.js scripts (`.mjs`), npm scripts

---

## File structure map

- Modify: `jest.config.ts`  
  Purpose: Restrict Jest discovery scope and keep config comments/ownership clear.
- Modify: `package.json`  
  Purpose: Add explicit suite scripts and boundary check command.
- Create: `tooling/scripts/validate-test-boundaries.mjs`  
  Purpose: Fail fast when Jest/Playwright boundaries are violated.
- Create: `docs/superpowers/testing-architecture-intent.md`  
  Purpose: Human-readable suite ownership and naming conventions.

---

### Task 1: Baseline and guard existing behavior

**Files:**
- Modify: none
- Test: existing command outputs only

- [ ] **Step 1: Capture current test and config baseline**

Run:
```bash
npm run check
npm test
npm run test:perf
```

Expected:
- `npm run check` exits `0`
- `npm test` exits `0`
- `npm run test:perf` exits `0` with mocked suites passing and real backend suite skipped by default

- [ ] **Step 2: Record baseline notes in local task log**

Record these exact fields in your working notes (not in source files):
```txt
date:
branch:
check_status:
test_status:
test_perf_status:
known_skips:
```

- [ ] **Step 3: Commit checkpoint (no code change)**

Do not create a git commit for this task unless you store notes in a tracked file. If no tracked file changes exist, skip commit.

---

### Task 2: Refactor Jest ownership boundaries

**Files:**
- Modify: `jest.config.ts`
- Test: `npm test`, `npm run test:coverage`

- [ ] **Step 1: Write failing boundary test (script preview)**

Create a temporary command to prove Jest currently includes the performance helper pattern:
```bash
npx jest --listTests
```

Expected (before edits):
- Output includes tests under `tests/unit` and `tests/integration`
- If any `tests/performance/**` `.test.ts` files exist, they appear (this is what we are removing)

- [ ] **Step 2: Update `jest.config.ts` to strict Jest ownership**

Replace the config object with:
```ts
import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/test-utils/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    // Keep MSW on CJS builds for Jest runtime compatibility.
    "^msw/node$": "<rootDir>/node_modules/msw/lib/node/index.js",
    "^msw$": "<rootDir>/node_modules/msw/lib/core/index.js",
  },
  testMatch: [
    "**/tests/unit/**/*.test.{ts,tsx}",
    "**/tests/integration/**/*.test.{ts,tsx}",
  ],
  testPathIgnorePatterns: [
    "<rootDir>/tests/e2e/",
    "<rootDir>/tests/performance/",
  ],
  collectCoverageFrom: [
    "src/components/**/*.{ts,tsx}",
    "src/lib/**/*.{ts,tsx}",
    "src/hooks/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
  ],
  coverageThreshold: {
    global: { branches: 50, functions: 50, lines: 50, statements: 50 },
  },
};

export default createJestConfig(config);
```

- [ ] **Step 3: Verify Jest discovery and execution**

Run:
```bash
npx jest --listTests
npm test
npm run test:coverage
```

Expected:
- `--listTests` does not include `tests/e2e` or `tests/performance`
- `npm test` exits `0`
- `npm run test:coverage` exits `0`

- [ ] **Step 4: Commit Jest boundary changes**

```bash
git add jest.config.ts
git commit -m "test(jest): restrict suite scope to unit and integration"
```

---

### Task 3: Normalize script matrix for targeted execution

**Files:**
- Modify: `package.json`
- Test: `npm run test:unit`, `npm run test:integration`, `npm run test:ci`

- [ ] **Step 1: Add explicit test scripts**

In `package.json` `scripts`, add/adjust entries:
```json
{
  "scripts": {
    "test": "jest --passWithNoTests",
    "test:unit": "jest --passWithNoTests tests/unit",
    "test:integration": "jest --passWithNoTests tests/integration",
    "test:coverage": "jest --coverage --passWithNoTests",
    "test:e2e": "playwright test",
    "test:perf": "playwright test -c playwright.perf.config.ts && node tooling/scripts/summarize-perf.mjs",
    "test:boundaries": "node tooling/scripts/validate-test-boundaries.mjs",
    "test:ci": "npm run check && npm run test && npm run test:boundaries"
  }
}
```

- [ ] **Step 2: Run targeted script verification**

Run:
```bash
npm run test:unit
npm run test:integration
npm run test:boundaries
npm run test:ci
```

Expected:
- each command exits `0`
- `test:ci` does not trigger Playwright by default

- [ ] **Step 3: Commit script matrix refactor**

```bash
git add package.json
git commit -m "chore(test): add explicit unit/integration/ci test scripts"
```

---

### Task 4: Add automated suite boundary guardrail

**Files:**
- Create: `tooling/scripts/validate-test-boundaries.mjs`
- Test: `npm run test:boundaries`

- [ ] **Step 1: Create failing condition test**

Temporarily create a local-only file (do not commit):
```txt
tests/performance/helpers/should-not-run-in-jest.test.ts
```

With content:
```ts
describe("boundary sentinel", () => {
  it("should never be matched by jest", () => {
    expect(true).toBe(true);
  });
});
```

Run:
```bash
npm run test:boundaries
```

Expected:
- boundary script detects invalid `.test.ts` under `tests/performance` and exits non-zero

Delete the sentinel file after verification.

- [ ] **Step 2: Implement boundary validation script**

Create `tooling/scripts/validate-test-boundaries.mjs`:
```js
import { readdir } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();

const violations = [];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }
    if (!entry.isFile()) continue;

    const normalized = fullPath.replaceAll("\\", "/");

    // Jest files must not live in Playwright directories.
    if (
      normalized.includes("/tests/performance/") &&
      normalized.match(/\.test\.(ts|tsx)$/)
    ) {
      violations.push(`Jest-style test in performance directory: ${normalized}`);
    }

    if (
      normalized.includes("/tests/e2e/") &&
      normalized.match(/\.test\.(ts|tsx)$/)
    ) {
      violations.push(`Jest-style test in e2e directory: ${normalized}`);
    }

    // Playwright specs should stay out of Jest directories.
    if (
      (normalized.includes("/tests/unit/") || normalized.includes("/tests/integration/")) &&
      normalized.match(/\.spec\.ts$/)
    ) {
      violations.push(`Playwright-style spec in Jest directory: ${normalized}`);
    }
  }
}

async function main() {
  await walk(join(root, "tests"));
  if (violations.length > 0) {
    console.error("Test boundary violations found:");
    for (const violation of violations) console.error(`- ${violation}`);
    process.exit(1);
  }
  console.log("Test boundary validation passed.");
}

main().catch((error) => {
  console.error("Boundary validation failed unexpectedly.");
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 3: Verify and commit guardrail**

Run:
```bash
npm run test:boundaries
```

Expected:
- prints `Test boundary validation passed.` and exits `0`

Commit:
```bash
git add tooling/scripts/validate-test-boundaries.mjs package.json
git commit -m "chore(test): enforce jest and playwright file boundaries"
```

---

### Task 5: Document testing ownership conventions

**Files:**
- Create: `docs/superpowers/testing-architecture-intent.md`
- Test: docs review + command snippets validated

- [ ] **Step 1: Add testing architecture intent document**

Create `docs/superpowers/testing-architecture-intent.md`:
```md
# Testing Architecture Intent

Date: 2026-04-25

## Suite ownership

- Jest owns:
  - `tests/unit/**/*.test.ts(x)`
  - `tests/integration/**/*.test.ts(x)`
- Playwright owns:
  - `tests/e2e/**/*.spec.ts`
  - `tests/performance/**/*.perf.spec.ts`

## Naming contract

- Use `.test.ts` / `.test.tsx` only for Jest tests.
- Use `.spec.ts` for Playwright tests.
- Use `.perf.spec.ts` for Playwright performance tests.

## Commands

- `npm run test` -> Jest default suite
- `npm run test:unit` -> Jest unit only
- `npm run test:integration` -> Jest integration only
- `npm run test:e2e` -> Playwright e2e
- `npm run test:perf` -> Playwright perf + summary
- `npm run test:boundaries` -> suite ownership guardrail
- `npm run test:ci` -> check + Jest + boundaries
```

- [ ] **Step 2: Validate docs match reality**

Run:
```bash
npm run test:boundaries
npm run test:ci
```

Expected:
- both commands exit `0`
- command names and behavior match the document

- [ ] **Step 3: Commit docs**

```bash
git add docs/superpowers/testing-architecture-intent.md
git commit -m "docs(test): define suite ownership and command matrix"
```

---

### Task 6: Final verification and handoff

**Files:**
- Modify: none (verification only)
- Test: full matrix

- [ ] **Step 1: Run final verification matrix**

Run:
```bash
npm run check
npm test
npm run test:coverage
npm run test:boundaries
npm run test:e2e
npm run test:perf
```

Expected:
- all commands exit `0` (allow existing, documented skips in real-backend perf suite)

- [ ] **Step 2: Generate final summary**

Include in PR description:
```md
## Testing architecture refactor summary
- Jest now targets only unit + integration paths.
- Playwright keeps ownership of e2e + perf specs.
- Added automated boundary guardrail script and CI-safe command matrix.
- Added testing architecture intent doc for contributor onboarding.
```

- [ ] **Step 3: Commit remaining files**

```bash
git add .
git commit -m "refactor(test): split suite ownership and add boundary guardrails"
```

---

## Spec coverage (self-review)

| Spec area | Plan coverage |
| --- | --- |
| Stability (runtime separation) | Tasks 2, 4 |
| Speed (explicit command targeting) | Tasks 3, 6 |
| Maintainability (docs + conventions) | Task 5 |
| Include `jest.config.ts` scope | Task 2 |

Placeholder scan: no `TODO` / `TBD` placeholders in executable steps.  
Type consistency: script names and file naming conventions are consistent across tasks.

