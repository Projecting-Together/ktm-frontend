import {
  trackPurposeModeChange,
  trackInquirySent,
  trackInquiryCtaClick,
  trackListingPostCompleted,
} from "@/lib/observability/analytics";

describe("analytics track helpers", () => {
  beforeEach(() => {
    jest.spyOn(window, "dispatchEvent").mockImplementation(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("dispatches purpose_mode_change with mode mapping", () => {
    trackPurposeModeChange({
      nextPurpose: "sale",
      previousPurpose: "rent",
      source: "search_page_toggle",
    });
    const evt = (window.dispatchEvent as jest.Mock).mock.calls[0][0] as CustomEvent;
    expect(evt.type).toBe("ktm-telemetry");
    expect(evt.detail).toEqual({
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

  it("dispatches inquiry_sent with listing context", () => {
    trackInquirySent({
      listingId: "listing-123",
      purpose: "sale",
      source: "listing_detail_cta",
    });
    const evt = (window.dispatchEvent as jest.Mock).mock.calls[0][0] as CustomEvent;
    expect(evt.detail).toEqual({
      event: "inquiry_sent",
      payload: {
        listing_id: "listing-123",
        purpose: "sale",
        mode: "buy",
        source: "listing_detail_cta",
      },
    });
  });

  it("dispatches inquiry_cta_click with listing context", () => {
    trackInquiryCtaClick({
      listingId: "listing-123",
      purpose: "sale",
      source: "listing_detail_cta",
    });
    const evt = (window.dispatchEvent as jest.Mock).mock.calls[0][0] as CustomEvent;
    expect(evt.detail).toEqual({
      event: "inquiry_cta_click",
      payload: {
        listing_id: "listing-123",
        purpose: "sale",
        mode: "buy",
        source: "listing_detail_cta",
      },
    });
  });

  it("dispatches listing_post_completed with purpose context", () => {
    trackListingPostCompleted({
      listingId: "listing-999",
      purpose: "rent",
      source: "listing_form_submit",
    });
    const evt = (window.dispatchEvent as jest.Mock).mock.calls[0][0] as CustomEvent;
    expect(evt.detail).toEqual({
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
