# Frontend Testing Architecture Refactor (Stability, Speed, Maintainability)

Date: 2026-04-25  
Status: Approved (brainstorming)  
Owner: Frontend Team

## 1) Goal

Refactor the frontend testing architecture so it is easier to scale and operate:

1. **Stability first**: reduce cross-runtime fragility between Jest and Playwright.
2. **Speed second**: make local/CI test targeting explicit and predictable.
3. **Maintainability**: enforce clear ownership boundaries for test files, helpers, and scripts.

This refactor includes `jest.config.ts` in scope and aligns with Wave 1-3 verification direction (especially `test:perf` ownership and reporting).

## 2) Decision summary (validated)

| Decision | Choice |
| --- | --- |
| Primary approach | **Testing architecture split by responsibility** (recommended Option 1). |
| Scope depth | **Deep rework** (user selected C): structural separation plus guardrails. |
| Runtime boundary | Jest handles unit/integration; Playwright handles e2e/perf. |
| Migration style | Stage-based rollout with reversible checkpoints. |
| Enforcement | Add lightweight contract checks to prevent suite overlap regressions. |

## 3) Scope

### In scope

- Update `jest.config.ts` to focus only on Jest-owned test categories.
- Remove perf-oriented test discovery from Jest patterns.
- Normalize script matrix in `package.json` for explicit suite targeting.
- Separate test utilities by runtime ownership (`jest` vs `playwright`).
- Add documentation defining test boundaries and naming conventions.
- Add guardrails/checks that fail if suite boundaries are violated.

### Out of scope

- Rewriting all existing tests to new patterns in one pass.
- Changing product behavior or runtime cache logic.
- Replacing Jest or Playwright with different frameworks.
- Large CI infrastructure changes beyond test command wiring.

## 4) Architecture

### 4.1 Suite ownership model

- **Jest**
  - `tests/unit/**` for pure units and narrow component/hook tests.
  - `tests/integration/**` for integrated module behavior still suited to Jest.
- **Playwright e2e**
  - `tests/e2e/**` for user-flow/browser behavior.
- **Playwright perf**
  - `tests/performance/**/*.perf.spec.ts` for perf and ISR verification harnesses.

Jest must not discover Playwright perf/e2e files, and Playwright suites must not rely on Jest runtime setup.

### 4.2 Config boundaries

- Keep `next/jest` integration as base.
- Restrict Jest `testMatch` to unit/integration ownership.
- Retain MSW resolver mapping (current CJS path mapping) with clear inline rationale and maintenance note.
- Keep coverage collection intentional (app logic surfaces only) so reported coverage remains meaningful.

### 4.3 Script architecture

- Introduce explicit scripts (or equivalent naming):
  - `test:unit`
  - `test:integration`
  - `test:ci` (ordered and explicit)
- Keep `test:perf` isolated as heavy, browser-backed verification.
- Ensure top-level `test` behavior is clear for contributors and CI defaults.

## 5) Data and dependency flow

- Jest consumes app code + Jest test utils only.
- Playwright consumes app runtime + Playwright helpers only.
- Shared helpers, if any, must remain runtime-neutral (no Jest globals, no browser-only APIs unless guarded).
- Dependency drift risk around MSW path mapping should be documented where configured.

## 6) Error handling and risks

| Risk | Mitigation |
| --- | --- |
| Accidental suite overlap after refactor | Add guardrails/check script and include in CI gate. |
| Hidden runtime coupling in helpers | Split helper directories by runtime and audit imports. |
| Temporary failures during migration | Roll out in stages; each stage is independently reversible. |
| Coverage drop/noise from path changes | Rebaseline coverage patterns and run `test:coverage` validation. |

## 7) Migration and rollout plan (design-level)

1. **Stage 1: Structural split (no intended behavior change)**
   - Update Jest discovery and scripts first.
   - Verify before/after parity for currently passing suites.
2. **Stage 2: Utility separation**
   - Move helpers into runtime-specific locations.
   - Keep only truly neutral helpers shared.
3. **Stage 3: Contract enforcement**
   - Add boundary-check command (script/lint/custom check).
   - Gate merges on boundary integrity plus core checks.

Each stage should be commit-isolated to make rollback safe and root-cause analysis fast.

## 8) Testing and verification requirements

- `npm run check`
- `npm run test` (post-refactor should map clearly to Jest-owned scope)
- `npm run test:e2e` (targeted sanity after boundary changes)
- `npm run test:perf` (ensure perf harness remains isolated and functioning)
- Optional: `npm run test:coverage` to validate coverage path updates

## 9) Success criteria

- Jest no longer matches perf/e2e specs.
- Playwright suites run without Jest-specific setup leakage.
- Developers can run targeted commands by intent (unit, integration, e2e, perf) without ambiguity.
- `jest.config.ts` is documented, concise, and resilient to dependency/runtime edge cases.
- Boundary guardrails are present and failing cases are actionable.

## 10) References

- `jest.config.ts`
- `playwright.perf.config.ts`
- `docs/superpowers/loading-and-suspense-intent.md`
- `docs/superpowers/deployment-runtime-and-invalidation.md`
- `docs/superpowers/specs/2026-04-24-frontend-wave3-loading-islands-isr-verification-design.md`

## 11) Next step

After this spec is reviewed, create an implementation plan using the writing-plans workflow:

- target files and exact edits for `jest.config.ts` and `package.json`
- helper relocation map (`tests/test-utils/**`)
- guardrail command choice and CI wiring
- verification checklist and rollback notes
