import { renderToStaticMarkup } from "react-dom/server";
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

describe("public home dynamic hero and metrics", () => {
  beforeEach(() => {
    (fetchPublicListings as jest.Mock).mockReset();
    (fetchPublicListings as jest.Mock).mockResolvedValue({
      data: { items: [{ id: "listing-1", title: "Modern flat in Baneshwor" }] },
      error: null,
    });
  });

  it("renders dynamic hero image wrapper and metric values", async () => {
    const html = renderToStaticMarkup(await HomePage());

    expect(html).toContain('data-testid="hero-image-wrapper"');
    expect(html).toContain('data-testid="hero-image-overlay"');
    expect(html).toContain("data-testid=\"home-metric-Active Listings\"");
    expect(html).toContain("data-testid=\"home-metric-Verified Properties\"");
    expect(html).not.toContain(">2,400+<");
    expect(html).not.toContain(">1,800+<");
  });
});
