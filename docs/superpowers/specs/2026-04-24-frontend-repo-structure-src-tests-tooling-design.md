# Frontend Repo Structure (`src` / `tests` / `tooling`) Design

Date: 2026-04-24
Status: Proposed and user-approved (brainstorming)
Owner: Frontend Team

## 1) Goal

Restructure `ktm-frontend` into a cleaner, more maintainable layout by:

- moving runtime application code under `src/`
- consolidating all tests under `tests/`
- grouping build/deploy helper assets under `tooling/`

while preserving Next.js conventions and avoiding unnecessary custom wiring.

## 2) Scope

### In scope

- Move runtime code directories into `src/`
- Move existing test directories into `tests/`
- Update Jest/Playwright/TypeScript path configuration to match new locations
- Define explicit root-level vs relocatable project assets
- Introduce a `tooling/` folder for build/deploy helper resources (scripts, CI fragments, Docker helpers)

### Out of scope

- Rewriting application features or business logic
- Replacing test frameworks or adding new test stacks
- Moving core Next.js root config files into nested folders
- Changing the runtime build output folder from `.next`

## 3) Decision Summary (Validated)

- Architecture choice: **Option 1**
  - `src/` for runtime app code
  - `tests/` for all tests
  - `tooling/` for build/deploy support assets
- Rationale:
  - keeps the repository clean and predictable
  - aligns with common Next.js team patterns
  - avoids high-friction custom config for framework-critical files

## 4) Target Repository Structure

```text
ktm-frontend/
  src/
    app/
    components/
    lib/
    shared/
    middleware.ts
  tests/
    unit/
    integration/
    e2e/
    test-utils/
  tooling/
    scripts/
    ci/
    docker/
  public/
  docs/
  next.config.ts
  tsconfig.json
  package.json
  jest.config.ts
  playwright.config.ts
  .env.example
```

## 5) Move Rules (What Moves vs What Stays)

### Move to `src/`

- `app/` -> `src/app/`
- `components/` -> `src/components/`
- `lib/` -> `src/lib/`
- `shared/` -> `src/shared/`
- `middleware.ts` -> `src/middleware.ts`

### Move to `tests/`

- `__tests__/unit` -> `tests/unit`
- `__tests__/integration` -> `tests/integration`
- `__tests__/e2e` -> `tests/e2e`
- `test-utils/` -> `tests/test-utils/`

### Keep at project root

- `next.config.ts`
- `tsconfig.json`
- `package.json`
- `jest.config.ts`
- `playwright.config.ts`
- `.env.example` and env files

### Keep at root by Next.js convention

- `public/`

## 6) Configuration Changes Required

### TypeScript / module resolution

- update path aliases so `@/*` resolves to `src/*`
- ensure compiler include/exclude patterns reflect `src/` and `tests/`

### Jest

- update `setupFilesAfterEnv` path to `tests/test-utils/...`
- update `testMatch` to `tests/unit` and `tests/integration`
- update `collectCoverageFrom` to target `src/**`

### Playwright

- set `testDir` to `tests/e2e`
- verify any fixtures/import helpers still resolve after test-utils relocation

## 7) Migration Strategy (Rollback-Safe)

1. Create target directories first (`src`, `tests/*`, `tooling/*`) without moving files.
2. Move tests first, then immediately update test config and run test checks.
3. Move runtime directories into `src/`, then update aliases and run type/dev checks.
4. Relocate build/deploy helper assets into `tooling/` (only approved helper assets).
5. Run production build/start validation and remove old empty directories.

Each phase is completed and verified before the next phase begins.

## 8) Error Handling and Recovery

- Treat import resolution failures during migration as expected, phase-local issues.
- Keep changes phase-bounded so rollback only touches the active phase.
- Avoid mixing test-path changes and runtime-path changes in the same step.
- Keep core root config in place to avoid hidden tool discovery failures.
- Use command-based checkpoints after each phase to catch silent path drift early.

## 9) Verification Matrix

### Gate A: after test migration

- `pnpm test`
- `pnpm test:e2e` (or agreed smoke subset)
- expectation: test discovery uses `tests/*`, with no stale `__tests__` references

### Gate B: after runtime migration to `src`

- `pnpm check`
- `pnpm dev`
- expectation: app compiles/runs and `@/` imports resolve to `src/*`

### Gate C: after tooling cleanup

- `pnpm build`
- `pnpm start`
- expectation: production build and startup succeed without path/config regressions

### Final confidence sweep (optional)

- `pnpm test:all`
- quick manual smoke for high-traffic routes

## 10) Risks and Mitigations

- Risk: stale path references remain in scripts or docs
  - Mitigation: include a cleanup pass and path-focused grep checks
- Risk: E2E/util imports break after test-utils move
  - Mitigation: migrate tests first and verify before runtime moves
- Risk: team confusion between `tooling/` and output artifacts
  - Mitigation: document that runtime output remains `.next` and `tooling/` is source-controlled support material

## 11) Acceptance Criteria

- Runtime app directories are under `src/` and app boots normally
- Unit/integration/e2e tests live under `tests/` and execute from updated configs
- Build/deploy helper assets are centralized under `tooling/` where applicable
- Core Next.js root conventions are preserved (`public/`, root config files)
- Type-check, tests, and production build/start pass at defined gates
