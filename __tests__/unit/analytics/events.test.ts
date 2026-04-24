import {
  buildPurposeModeChangeEvent,
  buildInquirySentEvent,
  buildListingPostCompletedEvent,
} from "@/lib/analytics/events";

describe("analytics events helpers", () => {
  it("builds purpose-mode-change payload with mode mapping", () => {
    expect(
      buildPurposeModeChangeEvent({
        nextPurpose: "sale",
        previousPurpose: "rent",
        source: "search_page_toggle",
      }),
    ).toEqual({
      event: "purpose_mode_change",
      payload: {
        purpose: "sale",
        mode: "buy",
        previous_purpose: "rent",
        previous_mode: "rent",
        source: "search_page_toggle",
      },
    });
  });

  it("builds inquiry-sent payload with listing context", () => {
    expect(
      buildInquirySentEvent({
        listingId: "listing-123",
        purpose: "sale",
        source: "listing_detail_cta",
      }),
    ).toEqual({
      event: "inquiry_sent",
      payload: {
        listing_id: "listing-123",
        purpose: "sale",
        mode: "buy",
        source: "listing_detail_cta",
      },
    });
  });

  it("builds listing-post-completed payload with purpose context", () => {
    expect(
      buildListingPostCompletedEvent({
        listingId: "listing-999",
        purpose: "rent",
        source: "listing_form_submit",
      }),
    ).toEqual({
      event: "listing_post_completed",
      payload: {
        listing_id: "listing-999",
        purpose: "rent",
        mode: "rent",
        source: "listing_form_submit",
      },
    });
  });
});
