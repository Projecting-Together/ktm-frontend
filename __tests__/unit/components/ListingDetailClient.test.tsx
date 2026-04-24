import React from "react";
import { render, screen } from "@/test-utils/renderWithProviders";
import ListingDetailClient from "@/components/listings/ListingDetailClient";
import { mockListings } from "@/test-utils/mockData";

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
});
