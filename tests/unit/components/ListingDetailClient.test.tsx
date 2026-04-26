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
  useListings: () => ({
    data: {
      items: mockListings,
    },
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

  it("shows rent detail section heading for rent listings", () => {
    const rentListing = mockListings[0];
    render(<ListingDetailClient listing={rentListing} />);

    expect(screen.getByRole("heading", { name: /^utilities$/i })).toBeInTheDocument();
  });

  it("does not show rent detail section heading for sale listings", () => {
    const saleListing = mockListings[4];
    render(<ListingDetailClient listing={saleListing} />);

    expect(screen.queryByRole("heading", { name: /^utilities$/i })).not.toBeInTheDocument();
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

  it("renders purpose-consistent related listings", () => {
    const saleListing = mockListings.find((listing) => listing.purpose === "sale");
    if (!saleListing) {
      throw new Error("Test data missing sale listing");
    }

    render(<ListingDetailClient listing={saleListing} />);

    expect(screen.getByRole("heading", { name: /related sale listings/i })).toBeInTheDocument();
    expect(screen.queryByText(/related rent listings/i)).not.toBeInTheDocument();
  });

  it("does not render security deposit text in the right-side card", () => {
    const rentListing = mockListings[0];
    render(<ListingDetailClient listing={rentListing} />);

    expect(screen.queryByText(/security deposit:/i)).not.toBeInTheDocument();
  });

  it("uses checkmark-only verified owner treatment without label text", () => {
    const rentListing = mockListings[0];
    render(<ListingDetailClient listing={rentListing} />);

    const detailVerifiedBadge = document.querySelector(".absolute.left-4.top-4");
    expect(detailVerifiedBadge).toBeTruthy();
    expect(detailVerifiedBadge).not.toHaveTextContent(/^verified$/i);
  });
});
