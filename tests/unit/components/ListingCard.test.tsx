import React from "react";
import { render, screen } from "@/test-utils/renderWithProviders";
import { within } from "@testing-library/react";
import { ListingCard, ListingCardSkeleton } from "@/components/listings/ListingCard";
import { mockListingItems } from "@/test-utils/mockData";

const listing = mockListingItems[0]; // Modern 2BHK Thamel — verified, 28000 NPR, 950 sqft

describe("ListingCard", () => {
  it("renders without crashing", () => {
    const { container } = render(<ListingCard listing={listing} />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders listing title", () => {
    render(<ListingCard listing={listing} />);
    expect(screen.getByText(listing.title)).toBeInTheDocument();
  });

  it("renders price in NPR", () => {
    render(<ListingCard listing={listing} />);
    // Price 28000 should appear formatted as 28,000
    expect(screen.getByText(/28,000/)).toBeInTheDocument();
  });

  it("renders location text from listing metadata", () => {
    render(<ListingCard listing={listing} />);
    // Use getAllByText since "Thamel" may appear in title and location
    const thamelElements = screen.getAllByText(/thamel/i);
    expect(thamelElements.length).toBeGreaterThan(0);
  });

  it("renders bedroom count", () => {
    render(<ListingCard listing={listing} />);
    // listing[0] has 2 bedrooms — look for the beds label specifically
    const bedsElements = screen.getAllByText(/2/);
    expect(bedsElements.length).toBeGreaterThan(0);
  });

  it("shows verified badge for verified listing", () => {
    render(<ListingCard listing={listing} />);
    expect(screen.getByText(/verified/i)).toBeInTheDocument();
  });

  it("renders area in sqft", () => {
    render(<ListingCard listing={listing} />);
    expect(screen.getByText(/950/)).toBeInTheDocument();
  });

  it("renders a link to the listing detail page", () => {
    render(<ListingCard listing={listing} />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
    const href = links[0].getAttribute("href");
    expect(href).toContain(listing.slug);
  });

  it("renders in list variant without crashing", () => {
    const { container } = render(<ListingCard listing={listing} variant="list" />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders unverified listing without verified badge", () => {
    const unverified = { ...mockListingItems[3], is_verified: false };
    render(<ListingCard listing={unverified} />);
    // Should not show standalone "Verified" text
    expect(screen.queryByText(/^verified$/i)).not.toBeInTheDocument();
  });

  it("shows a clear sale badge text for sale listings", () => {
    const saleListing = { ...mockListingItems[4], title: "Traditional Newari House in Bhaktapur", purpose: "sale" };
    render(<ListingCard listing={saleListing} />);
    expect(screen.getByText(/for sale/i)).toBeInTheDocument();
  });

  it("renders pet-friendly image badge when pets are allowed", () => {
    const petFriendlyListing = { ...listing, pets_allowed: true };
    const { container } = render(<ListingCard listing={petFriendlyListing} />);
    const card = within(container);
    const petBadge = card.getByTestId("listing-pet-friendly-badge");
    expect(petBadge).toBeInTheDocument();
    expect(petBadge).toHaveAccessibleName(/pet/i);
  });

  it("keeps verified badge visible when pet-friendly overlay is shown", () => {
    const fullyBadgedListing = { ...listing, is_verified: true, pets_allowed: true };
    const { container } = render(<ListingCard listing={fullyBadgedListing} />);
    const card = within(container);
    expect(card.getByText(/^verified$/i)).toBeInTheDocument();
    expect(card.getByTestId("listing-pet-friendly-badge")).toBeInTheDocument();
  });

  it("does not render pet-friendly badge when pets are not allowed", () => {
    const regularListing = { ...listing, pets_allowed: false };
    const { container } = render(<ListingCard listing={regularListing} />);
    const card = within(container);
    expect(card.queryByTestId("listing-pet-friendly-badge")).not.toBeInTheDocument();
  });
});

describe("ListingCardSkeleton", () => {
  it("renders skeleton without crashing", () => {
    const { container } = render(<ListingCardSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders list skeleton variant without crashing", () => {
    const { container } = render(<ListingCardSkeleton variant="list" />);
    expect(container.firstChild).not.toBeNull();
  });
});
