import React from "react";
import { render, screen } from "@/test-utils/renderWithProviders";
import userEvent from "@testing-library/user-event";
import ListingDetailClient from "@/components/listings/ListingDetailClient";
import { mockListings } from "@/test-utils/mockData";
import { trackInquiryCtaClick } from "@/lib/analytics/events";

jest.mock("@/lib/hooks/useListings", () => ({
  useListing: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
  }),
}));

jest.mock("@/lib/hooks/useFavorites", () => ({
  useIsFavorite: () => false,
  useToggleFavorite: () => ({ mutate: jest.fn() }),
}));

jest.mock("@/lib/stores/authStore", () => ({
  useAuthStore: () => ({ isAuthenticated: true }),
}));

jest.mock("@/lib/analytics/events", () => ({
  trackInquiryCtaClick: jest.fn(),
}));

describe("ListingDetailClient", () => {
  it("shows seller-specific inquiry CTA for sale listings", () => {
    const saleListing = mockListings[4];
    render(<ListingDetailClient listing={saleListing} />);
    expect(screen.getByRole("link", { name: /send inquiry to seller/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^apartments$/i })).toHaveAttribute(
      "href",
      "/apartments?purpose=sale",
    );
  });

  it("keeps default inquiry CTA for rent listings", () => {
    const rentListing = mockListings[0];
    render(<ListingDetailClient listing={rentListing} />);
    expect(screen.getByRole("link", { name: /send inquiry$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^apartments$/i })).toHaveAttribute("href", "/apartments");
  });

  it("tracks inquiry CTA click with click semantics", async () => {
    const saleListing = mockListings[4];
    const user = userEvent.setup();
    render(<ListingDetailClient listing={saleListing} />);

    await user.click(screen.getByRole("link", { name: /send inquiry to seller/i }));

    expect(trackInquiryCtaClick).toHaveBeenCalledWith({
      listingId: saleListing.id,
      purpose: "sale",
      source: "listing_detail_cta",
    });
  });
});
