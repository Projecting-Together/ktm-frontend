import { scenarioCatalog } from "@/msw/mockScenarioData";

const requiredStates = ["happy", "empty", "error", "partial", "permission", "stress"] as const;

describe("mockScenarioData", () => {
  it("exposes scenario domains", () => {
    expect(scenarioCatalog.public).toBeDefined();
    expect(scenarioCatalog.auth).toBeDefined();
    expect(scenarioCatalog.admin).toBeDefined();
  });

  it("includes all required states in each domain", () => {
    const domains = [scenarioCatalog.public, scenarioCatalog.auth, scenarioCatalog.admin];

    for (const domain of domains) {
      for (const state of requiredStates) {
        expect(domain).toHaveProperty(state);
      }
    }
  });
});
