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
