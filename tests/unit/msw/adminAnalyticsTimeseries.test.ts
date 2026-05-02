import { describe, expect, it } from "@jest/globals";
import { buildAdminAnalyticsTimeseries } from "@/msw/adminAnalyticsTimeseries";

describe("buildAdminAnalyticsTimeseries", () => {
  it("applies dateRange relative to latest analytics series date", () => {
    const analytics = buildAdminAnalyticsTimeseries({ dateRange: "last-7-days" });

    expect(analytics).toHaveLength(5);
    expect(analytics[0].date).toBe("2026-04-20");
    expect(analytics[analytics.length - 1].date).toBe("2026-04-24");
  });
});
