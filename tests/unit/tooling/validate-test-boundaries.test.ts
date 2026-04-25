import { validateTestFilePath } from "../../../tooling/scripts/validate-test-boundaries.mjs";

describe("validateTestFilePath", () => {
  it("passes valid tests/performance/*.perf.spec.ts files", () => {
    const filePath = "/repo/tests/performance/search.perf.spec.ts";

    const violations = validateTestFilePath(filePath);

    expect(violations).toEqual([]);
  });

  it("fails tests/performance/*.spec.ts without .perf. naming", () => {
    const filePath = "/repo/tests/performance/search.spec.ts";

    const violations = validateTestFilePath(filePath);

    expect(violations).toContain(
      `Performance specs must use *.perf.spec.ts naming: ${filePath}`,
    );
  });

  it("allows non-performance Playwright specs in tests/e2e", () => {
    const filePath = "/repo/tests/e2e/homepage.spec.ts";

    const violations = validateTestFilePath(filePath);

    expect(violations).toEqual([]);
  });
});
