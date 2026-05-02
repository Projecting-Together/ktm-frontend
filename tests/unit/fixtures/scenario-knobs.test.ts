import { mswScenarioKnobs } from "@/test-utils/fixtures";

describe("MSW scenario knobs (fixtures/scenarios/msw-scenarios.json)", () => {
  it("exposes message keys used by mockScenarioData", () => {
    expect(mswScenarioKnobs.messages.internalServerError.length).toBeGreaterThan(0);
    expect(mswScenarioKnobs.messages.forbidden).toBe("Forbidden");
    expect(mswScenarioKnobs.messages.notAuthenticated).toContain("Not");
  });

  it("exposes numeric knobs", () => {
    expect(mswScenarioKnobs.numericKnobs.partialListingSliceEnd).toBe(2);
    expect(mswScenarioKnobs.numericKnobs.stressBioRepeatLength).toBe(700);
    expect(mswScenarioKnobs.numericKnobs.stressAnalyticsTotalViews).toBe(9_999_999);
  });
});
