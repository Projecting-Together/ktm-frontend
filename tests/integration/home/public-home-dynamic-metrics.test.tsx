import { render, screen } from "@testing-library/react";
import HomePage from "@/app/(public)/page";
import { fetchPublicListings } from "@/lib/api/server-public-listings";

jest.mock("@/lib/api/server-public-listings", () => ({
  fetchPublicListings: jest.fn(),
}));

jest.mock("@/components/search/SearchBar", () => ({
  SearchBar: () => <div data-testid="search-bar">Search</div>,
}));

jest.mock("@/components/listings/ListingCard", () => ({
  ListingCard: ({ listing }: { listing: { id: string; title: string } }) => (
    <article data-testid="listing-card">{listing.title ?? listing.id}</article>
  ),
  ListingCardSkeleton: () => <div data-testid="listing-card-skeleton">Loading</div>,
}));

describe("public home dynamic hero, banner, and metrics", () => {
  beforeEach(() => {
    (fetchPublicListings as jest.Mock).mockReset();
    (fetchPublicListings as jest.Mock).mockResolvedValue({
      data: { items: [{ id: "listing-1", title: "Modern flat in Baneshwor" }] },
      error: null,
    });
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: true,
        media: "(prefers-reduced-motion: reduce)",
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  it("renders hero and cta image wrappers with formatted dynamic metrics", async () => {
    render(await HomePage());
    const yearsServingRenters = Math.max(1, new Date().getUTCFullYear() - 2021);

    expect(screen.getByTestId("hero-image-wrapper")).toBeInTheDocument();
    expect(screen.getByTestId("hero-image-overlay")).toBeInTheDocument();
    expect(screen.getByTestId("cta-image-wrapper")).toBeInTheDocument();
    expect(screen.getByTestId("cta-image-overlay")).toBeInTheDocument();

    expect(screen.getByTestId("home-metric-Active Listings")).toHaveTextContent("2,402+");
    expect(screen.getByTestId("home-metric-Verified Properties")).toHaveTextContent("1,800+");
    expect(screen.getByTestId("home-metric-Years Serving Renters")).toHaveTextContent(
      `${yearsServingRenters}+`
    );
    expect(screen.getByTestId("home-metric-Happy Renters")).toHaveTextContent("5,004+");
  });
});
