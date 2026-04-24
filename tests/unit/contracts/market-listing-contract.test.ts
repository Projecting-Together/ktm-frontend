import {
  getMarketListingSubmitStatus,
  MARKET_LISTING_SUBMIT_STATUSES,
} from "@/lib/contracts/marketListing";

describe("market listing contract", () => {
  it("defines expected submit statuses", () => {
    expect(MARKET_LISTING_SUBMIT_STATUSES).toEqual([
      "pending_review",
      "published",
    ]);
  });

  it("maps owner submit transition to pending_review", () => {
    expect(getMarketListingSubmitStatus("owner")).toBe("pending_review");
  });

  it("maps agent and admin submit transitions to published", () => {
    expect(getMarketListingSubmitStatus("agent")).toBe("published");
    expect(getMarketListingSubmitStatus("admin")).toBe("published");
  });
});
