import {
  MARKET_LISTING_STATUSES,
  nextStatusForSubmit,
} from "@/lib/contracts/marketListing";

describe("market listing contract", () => {
  it("defines expected full market listing statuses", () => {
    expect(MARKET_LISTING_STATUSES).toEqual([
      "draft",
      "pending_review",
      "published",
      "rejected",
    ]);
  });

  it("maps owner submit transition to pending_review", () => {
    expect(nextStatusForSubmit("owner")).toBe("pending_review");
  });

  it("maps agent and admin submit transitions to published", () => {
    expect(nextStatusForSubmit("agent")).toBe("published");
    expect(nextStatusForSubmit("admin")).toBe("published");
  });
});
