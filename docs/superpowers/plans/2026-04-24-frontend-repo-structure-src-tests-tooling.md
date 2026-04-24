# Frontend Repo Structure (`src` / `tests` / `tooling`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move runtime code to `src/`, move all tests to `tests/`, and introduce `tooling/` for build/deploy helper assets while preserving Next.js conventions and keeping the app green at each checkpoint.

**Architecture:** Execute in phase-gated slices: (1) scaffold directories, (2) migrate tests + test tooling, (3) migrate runtime code + TS/alias wiring, (4) move approved helper assets into `tooling/`, then (5) run full validation and cleanup. Each phase is independently verifiable and rollback-safe.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Jest (`next/jest`), Playwright, pnpm, PowerShell.

---

### Task 1: Preflight Baseline and Directory Scaffolding

**Files:**
- Create: `src/.gitkeep`
- Create: `tests/.gitkeep`
- Create: `tests/unit/.gitkeep`
- Create: `tests/integration/.gitkeep`
- Create: `tests/e2e/.gitkeep`
- Create: `tests/test-utils/.gitkeep`
- Create: `tooling/scripts/.gitkeep`
- Create: `tooling/ci/.gitkeep`
- Create: `tooling/docker/.gitkeep`
- Modify: none
- Test: command-only baseline checks

- [ ] **Step 1: Capture baseline command outcomes**

Run:
```bash
pnpm check
pnpm test
pnpm build
```

Expected:
- `pnpm check` exits 0
- `pnpm test` exits 0 (or known current baseline failures are recorded)
- `pnpm build` exits 0

- [ ] **Step 2: Create target folders**

Run:
```bash
mkdir src, tests, tests/unit, tests/integration, tests/e2e, tests/test-utils, tooling, tooling/scripts, tooling/ci, tooling/docker
```

Expected:
- directories exist
- no app/test behavior changes yet

- [ ] **Step 3: Commit scaffolding**

Run:
```bash
git add src tests tooling
git commit -m "chore: scaffold src tests and tooling directories"
```

Expected: commit created with only empty directory markers.

---

### Task 2: Migrate Test Layout and Update Jest/Playwright Paths

**Files:**
- Modify: `jest.config.ts`
- Modify: `playwright.config.ts`
- Move: `__tests__/unit/**` -> `tests/unit/**`
- Move: `__tests__/integration/**` -> `tests/integration/**`
- Move: `__tests__/e2e/**` -> `tests/e2e/**`
- Move: `test-utils/**` -> `tests/test-utils/**`
- Test: `tests/unit/**/*.test.tsx`, `tests/integration/**/*.test.tsx`, `tests/e2e/**/*.spec.ts`

- [ ] **Step 1: Move test files into new structure**

Run:
```bash
git mv __tests__/unit tests/unit
git mv __tests__/integration tests/integration
git mv __tests__/e2e tests/e2e
git mv test-utils/* tests/test-utils/
```

Expected:
- test files are only in `tests/*`
- `__tests__` no longer contains moved suites

- [ ] **Step 2: Update Jest config to discover moved tests**

Apply this shape in `jest.config.ts`:
```ts
setupFilesAfterEnv: ["<rootDir>/tests/test-utils/jest.setup.ts"],
moduleNameMapper: {
  "^@/(.*)$": "<rootDir>/src/$1",
  "^msw/node$": "<rootDir>/node_modules/msw/lib/node/index.js",
  "^msw$": "<rootDir>/node_modules/msw/lib/core/index.js",
},
testMatch: [
  "**/tests/unit/**/*.test.{ts,tsx}",
  "**/tests/integration/**/*.test.{ts,tsx}",
],
collectCoverageFrom: [
  "src/components/**/*.{ts,tsx}",
  "src/lib/**/*.{ts,tsx}",
  "!**/*.d.ts",
  "!**/node_modules/**",
  "!**/.next/**",
],
```

- [ ] **Step 3: Update Playwright test discovery**

Change `playwright.config.ts`:
```ts
testDir: "./tests/e2e",
```

- [ ] **Step 4: Run focused test discovery checks**

Run:
```bash
pnpm test
pnpm test:e2e -- --list
```

Expected:
- Jest executes suites from `tests/unit` and `tests/integration`
- Playwright lists specs from `tests/e2e`

- [ ] **Step 5: Commit test-layout migration**

Run:
```bash
git add tests jest.config.ts playwright.config.ts
git commit -m "test: migrate suites to tests directory and update runners"
```

Expected: one commit containing test moves + runner config path updates.

---

### Task 3: Move Runtime Code into `src` and Rewire TypeScript Paths

**Files:**
- Modify: `tsconfig.json`
- Move: `app/**` -> `src/app/**`
- Move: `components/**` -> `src/components/**`
- Move: `lib/**` -> `src/lib/**`
- Move: `shared/**` -> `src/shared/**`
- Move: `middleware.ts` -> `src/middleware.ts`
- Test: type-check and dev startup

- [ ] **Step 1: Move runtime directories**

Run:
```bash
git mv app src/app
git mv components src/components
git mv lib src/lib
git mv shared src/shared
git mv middleware.ts src/middleware.ts
```

Expected:
- runtime files exist under `src/*`
- root runtime folders are removed from tracked files

- [ ] **Step 2: Update `tsconfig.json` includes and aliases**

Update to this shape:
```json
{
  "include": [
    "src/**/*",
    ".next/types/**/*.ts"
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["./src/shared/*"]
    }
  }
}
```

Note:
- keep existing strictness/compiler flags unchanged
- preserve existing exclude entries unless proven wrong by type-check

- [ ] **Step 3: Validate imports and app boot**

Run:
```bash
pnpm check
pnpm dev
```

Expected:
- `pnpm check` exits 0 with `@/` resolving to `src/*`
- Next app starts successfully with routes discovered from `src/app`

- [ ] **Step 4: Commit runtime migration**

Run:
```bash
git add src tsconfig.json
git commit -m "refactor: move runtime code under src and update ts paths"
```

Expected: one commit with runtime moves and TS wiring updates.

---

### Task 4: Introduce `tooling/` for Build/Deploy Helpers

**Files:**
- Create/Move (only if present and approved): `tooling/scripts/*`, `tooling/ci/*`, `tooling/docker/*`
- Modify (if references exist): docs or scripts that point to old helper locations
- Test: verify helper script invocation paths

- [ ] **Step 1: Inventory candidate helper assets**

Run:
```bash
rg --files | rg "docker|scripts|ci|compose|deploy"
```

Expected:
- list of candidate helper assets that are not framework root configs

- [ ] **Step 2: Move only approved helper assets into `tooling`**

Examples:
```bash
git mv scripts/* tooling/scripts/
git mv .github/workflows/reusable/* tooling/ci/
```

Guardrails:
- do **not** move `next.config.ts`, `tsconfig.json`, `package.json`, `jest.config.ts`, `playwright.config.ts`, `public/`

- [ ] **Step 3: Update references to moved helper assets**

Use targeted updates for any path changes:
```bash
rg "scripts/|docker/|ci/" -n README* docs .github package.json
```

Expected:
- references point to `tooling/*`
- no broken script path references

- [ ] **Step 4: Commit tooling organization**

Run:
```bash
git add tooling .github docs package.json
git commit -m "chore: organize build and deploy helpers under tooling"
```

Expected: commit only includes approved helper moves + reference updates.

---

### Task 5: Full Verification, Cleanup, and Documentation Sync

**Files:**
- Modify: `docs/**` (if path references changed)
- Remove: empty legacy directories left after migration
- Test: full command matrix

- [ ] **Step 1: Run full verification matrix**

Run:
```bash
pnpm check
pnpm test
pnpm test:e2e -- --list
pnpm build
```

Optional final sweep:
```bash
pnpm test:all
```

Expected:
- all required gates pass
- no regressions from path migration

- [ ] **Step 2: Remove empty legacy directories**

Run:
```bash
git status --short
```

Then remove any now-empty folders (example):
```bash
rmdir app components lib shared __tests__ test-utils
```

Expected:
- no stale empty top-level runtime/test folders

- [ ] **Step 3: Sync docs with final structure**

Update docs references to new locations:
```bash
rg "__tests__|test-utils/|components/|lib/|shared/|app/" docs README* -n
```

Expected:
- docs reference `src/*` and `tests/*` where relevant

- [ ] **Step 4: Commit final cleanup**

Run:
```bash
git add -A
git commit -m "docs: finalize repo structure migration references and cleanup"
```

Expected: cleanup/docs-only final commit.

---

### Task 6: Post-Migration Sanity Check for Next.js Conventions

**Files:**
- Verify only (no required edits): `next.config.ts`, `package.json`, `public/`

- [ ] **Step 1: Verify framework-critical root files stayed at root**

Check:
- `next.config.ts` at root
- `tsconfig.json` at root
- `package.json` at root
- `public/` at root

Expected: all present in root.

- [ ] **Step 2: Verify no output-folder confusion**

Run:
```bash
pnpm build
```

Expected:
- build artifacts still under `.next/`
- `tooling/` contains only source-controlled helper assets (not generated output)

- [ ] **Step 3: Final checkpoint commit if needed**

Run:
```bash
git status --short
```

If non-empty and intentional:
```bash
git add -A
git commit -m "chore: finalize nextjs convention checks after structure migration"
```

Expected: clean working tree.

---

## Spec Coverage Check

- `src/` runtime migration: covered by Task 3.
- `tests/` consolidation: covered by Task 2.
- `tooling/` for build/deploy helpers: covered by Task 4.
- rollback-safe sequencing and checkpoints: covered by Task order + task-local gates.
- verification matrix (`check`, tests, build/start expectations): covered by Tasks 2, 3, 5, 6.
- preserve Next.js conventions (`public/`, root configs, `.next` output): covered by Tasks 4 and 6.

## Placeholder Scan

- No `TODO`, `TBD`, or deferred implementation placeholders included.
- Each migration phase includes explicit files, commands, and expected results.

## Type and Path Consistency Check

- Alias target is consistently `@/* -> ./src/*` across Jest and TypeScript tasks.
- Test paths consistently use `tests/unit`, `tests/integration`, `tests/e2e`, `tests/test-utils`.
- Runtime paths consistently use `src/app`, `src/components`, `src/lib`, `src/shared`, `src/middleware.ts`.
