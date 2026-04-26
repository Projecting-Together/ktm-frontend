import { renderToStaticMarkup } from "react-dom/server";
import { fireEvent, render, screen } from "@testing-library/react";
import PublicMarketListingPage from "@/app/(public)/market-listing/page";
import PublicMarketListingDetailPage from "@/app/(public)/market-listing/[slug]/page";
import ManageMarketListingPage from "@/app/manage/market-listing/page";
import AdminMarketListingPage from "@/app/admin/market-listing/page";
import { getMarketListingDetail, getMarketListings } from "@/lib/api/client";
import { canModerateMarketListingTransition } from "@/lib/contracts/marketListing";
import { useMarketListings } from "@/lib/hooks/useMarketListings";
import { useAuthStore } from "@/lib/stores/authStore";
import { adaptListingsForSearch } from "@/lib/contracts/adapters";
import { ListingCard } from "@/components/listings/ListingCard";
import { notFound } from "next/navigation";

jest.mock("@/lib/api/client", () => ({
  getMarketListings: jest.fn(),
  getMarketListingDetail: jest.fn(),
}));

jest.mock("@/lib/hooks/useMarketListings", () => {
  const actual = jest.requireActual("@/lib/hooks/useMarketListings");
  return {
    ...actual,
    useMarketListings: jest.fn(),
  };
});

jest.mock("@/lib/stores/authStore", () => ({
  useAuthStore: jest.fn(),
}));

jest.mock("@/lib/hooks/useFavorites", () => ({
  useIsFavorite: () => false,
  useToggleFavorite: () => ({ mutate: jest.fn(), isPending: false }),
}));

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

describe("market listing public and moderation pages", () => {
  beforeEach(() => {
    (getMarketListings as jest.Mock).mockReset();
    (getMarketListingDetail as jest.Mock).mockReset();
    (useMarketListings as jest.Mock).mockReset();
    (useAuthStore as jest.Mock).mockReset();
    (notFound as jest.Mock).mockClear();
    (useMarketListings as jest.Mock).mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isError: false,
    });
    (useAuthStore as jest.Mock).mockReturnValue({ user: { role: "owner" } });
  });

  it("public market index excludes non-published content from render output", async () => {
    (getMarketListings as jest.Mock).mockResolvedValue({
      data: {
        items: [
          {
            id: "market-1",
            title: "Thamel apartment trend",
            slug: "thamel-apartment-trend",
            description: "Average rents for central apartments increased this month.",
            price: 75000,
            currency: "NPR",
            location: "Thamel, Kathmandu",
            property_type: "apartment",
            status: "published",
            published_at: "2026-04-24T12:00:00.000Z",
            created_at: "2026-04-20T08:00:00.000Z",
            updated_at: "2026-04-24T09:00:00.000Z",
          },
          {
            id: "market-2",
            title: "Draft market post",
            slug: "draft-market-post",
            description: "This should not appear on the public page.",
            price: 64000,
            currency: "NPR",
            location: "Lazimpat, Kathmandu",
            property_type: "apartment",
            status: "draft",
            published_at: null,
            created_at: "2026-04-20T08:00:00.000Z",
            updated_at: "2026-04-24T09:00:00.000Z",
          },
        ],
      },
      error: null,
    });

    const html = renderToStaticMarkup(await PublicMarketListingPage());

    expect(getMarketListings).toHaveBeenCalledWith({ page: 1, limit: 12, status: "published" });
    expect(html).toContain(">Market Listings<");
    expect(html).toContain(">Thamel apartment trend<");
    expect(html).toContain(">Average rents for central apartments increased this month.<");
    expect(html).toContain('href="/market-listing/thamel-apartment-trend"');
    expect(html).not.toContain(">Draft market post<");
  });

  it("public market detail renders published listing content", async () => {
    (getMarketListingDetail as jest.Mock).mockResolvedValue({
      data: {
        id: "market-1",
        title: "Thamel apartment trend",
        slug: "thamel-apartment-trend",
        description: "Average rents for central apartments increased this month.",
        price: 75000,
        currency: "NPR",
        location: "Thamel, Kathmandu",
        property_type: "apartment",
        status: "published",
        published_at: "2026-04-24T12:00:00.000Z",
        created_at: "2026-04-20T08:00:00.000Z",
        updated_at: "2026-04-24T09:00:00.000Z",
      },
      error: null,
    });

    const html = renderToStaticMarkup(
      await PublicMarketListingDetailPage({ params: Promise.resolve({ slug: "thamel-apartment-trend" }) }),
    );

    expect(getMarketListingDetail).toHaveBeenCalledWith("thamel-apartment-trend");
    expect(html).toContain(">Thamel apartment trend<");
    expect(html).toContain(">Average rents for central apartments increased this month.<");
    expect(html).toContain('href="/market-listing"');
  });

  it("public market detail uses notFound only for true 404", async () => {
    (getMarketListingDetail as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: "Market listing not found", status: 404 },
    });

    await expect(PublicMarketListingDetailPage({ params: Promise.resolve({ slug: "missing-market-post" }) })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it("public market detail uses notFound for non-published listing records", async () => {
    (getMarketListingDetail as jest.Mock).mockResolvedValue({
      data: {
        id: "market-2",
        title: "Pending market post",
        slug: "pending-market-post",
        description: "Pending moderation content",
        price: 64000,
        currency: "NPR",
        location: "Lazimpat, Kathmandu",
        property_type: "apartment",
        status: "pending_review",
        published_at: null,
        created_at: "2026-04-20T08:00:00.000Z",
        updated_at: "2026-04-24T09:00:00.000Z",
      },
      error: null,
    });

    await expect(PublicMarketListingDetailPage({ params: Promise.resolve({ slug: "pending-market-post" }) })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it("public market detail renders explicit error state for non-404 errors", async () => {
    (getMarketListingDetail as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: "Service unavailable", status: 503 },
    });

    const html = renderToStaticMarkup(
      await PublicMarketListingDetailPage({ params: Promise.resolve({ slug: "thamel-apartment-trend" }) }),
    );

    expect(notFound).not.toHaveBeenCalled();
    expect(html).toContain(">Market listing temporarily unavailable<");
    expect(html).toContain(">We could not load this market listing right now. Please try again shortly.<");
  });

  it("manage market listing page allows submit intent with visible feedback", () => {
    render(<ManageMarketListingPage />);

    fireEvent.click(screen.getByRole("button", { name: "Submit For Review" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Owner market listing submitted to flagged moderation queue after a risk signal.",
    );
  });

  it("manage market listing page allows trusted agent submit path per contract", () => {
    (useAuthStore as jest.Mock).mockReturnValue({ user: { role: "agent" } });

    render(<ManageMarketListingPage />);

    fireEvent.click(screen.getByRole("button", { name: "Submit For Review" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Trusted agent cleared the flagged listing and published it to public market surfaces.",
    );
    expect(screen.getByText(/Current listing state:/)).toHaveTextContent("published");
  });

  it("manage market listing page disables moderation actions for unauthenticated users", () => {
    (useAuthStore as jest.Mock).mockReturnValue({ user: null });

    render(<ManageMarketListingPage />);

    expect(screen.getByRole("button", { name: "Submit For Review" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Publish Now" })).toBeDisabled();
  });

  it("admin market listing page supports reject action with reason and feedback", () => {
    (useAuthStore as jest.Mock).mockReturnValue({ user: { role: "admin" } });

    render(<AdminMarketListingPage />);

    expect(screen.getByRole("heading", { name: "Flagged Listings Moderation Queue" })).toBeInTheDocument();
    expect(screen.getByText("flagged-listings-first")).toBeInTheDocument();
    expect(
      screen.getByText("Only flagged or risk-signaled listings require manual moderation review."),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Rejection reason"), {
      target: { value: "Missing market comps." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    expect(screen.getByRole("status")).toHaveTextContent("Rejected listing with reason: Missing market comps.");
    expect(screen.getByText("Latest rejection reason: Missing market comps.")).toBeInTheDocument();
  });

  it("admin market listing page validates rejection reason before reject action", () => {
    (useAuthStore as jest.Mock).mockReturnValue({ user: { role: "admin" } });

    render(<AdminMarketListingPage />);

    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    expect(screen.getByRole("status")).toHaveTextContent("Provide a rejection reason before rejecting.");
  });

  it("manage market listing page blocks invalid publish transition with explicit feedback", () => {
    (useAuthStore as jest.Mock).mockReturnValue({ user: { role: "agent" } });

    render(<ManageMarketListingPage />);

    fireEvent.click(screen.getByRole("button", { name: "Publish Now" }));

    expect(screen.getByRole("status")).toHaveTextContent("Market listing must be in pending review before publish.");
  });

  it("admin market listing page blocks moderation actions for non-admin users", () => {
    (useAuthStore as jest.Mock).mockReturnValue({ user: { role: "owner" } });

    render(<AdminMarketListingPage />);

    expect(screen.getByText("Admin access required for moderation actions.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reject" })).not.toBeInTheDocument();
  });

  it("admin market listing page blocks invalid transitions using contract rules", () => {
    (useAuthStore as jest.Mock).mockReturnValue({ user: { role: "admin" } });
    expect(canModerateMarketListingTransition("pending_review", "unpublished")).toBe(false);

    render(<AdminMarketListingPage />);

    fireEvent.click(screen.getByRole("button", { name: "Unpublish" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Transition blocked: cannot move from pending review to unpublished.",
    );
    expect(screen.getByRole("status")).toHaveClass("bg-rose-50");
  });

  it("shows sponsored label on listing cards for transparent trust signaling", () => {
    const sponsoredListing = {
      id: "listing-sponsored-1",
      slug: "listing-sponsored-1",
      title: "Sponsored listing",
      description: "Sponsored content",
      purpose: "rent",
      property_type: "apartment",
      listing_type: "apartment",
      furnishing: null,
      bedrooms: 2,
      bathrooms: 1,
      area_m2: 80,
      price: 35000,
      currency: "NPR",
      price_period: "month",
      images: [],
      amenities: [],
      is_verified: false,
      is_sponsored: true,
      is_moderated: false,
      pets_allowed: false,
      parking: false,
      smoking_allowed: false,
      status: "active",
      owner: null,
      location: {
        city: "Kathmandu",
        district: "Kathmandu",
        municipality: null,
        ward: null,
        neighborhood: null,
        latitude: 27.7,
        longitude: 85.3,
      },
      created_at: "2026-04-20T08:00:00.000Z",
      updated_at: "2026-04-20T08:00:00.000Z",
      available_from: null,
      floor: null,
      total_floors: null,
      price_negotiable: false,
      utilities: null,
      restrictions: null,
    };

    render(<ListingCard listing={sponsoredListing as never} />);
    expect(screen.getByText("Sponsored")).toBeInTheDocument();
  });

  it("applies deterministic sponsored merge with fairness caps", () => {
    const listings = adaptListingsForSearch([
      { id: "s1", title: "Sponsored 1", slug: "s1", is_sponsored: true, sponsored_weight: 0.7 },
      { id: "o1", title: "Organic 1", slug: "o1", is_sponsored: false },
      { id: "s2", title: "Sponsored 2", slug: "s2", is_sponsored: true, sponsored_weight: 0.9 },
      { id: "o2", title: "Organic 2", slug: "o2", is_sponsored: false },
      { id: "o3", title: "Organic 3", slug: "o3", is_sponsored: false },
      { id: "s3", title: "Sponsored 3", slug: "s3", is_sponsored: true, sponsored_weight: 1.2 },
      { id: "o4", title: "Organic 4", slug: "o4", is_sponsored: false },
      { id: "o5", title: "Organic 5", slug: "o5", is_sponsored: false },
    ] as never);

    const sponsoredIndexes = listings
      .map((listing, index) => ({ listing, index }))
      .filter(({ listing }) => listing.is_sponsored)
      .map(({ index }) => index);

    expect(sponsoredIndexes.length).toBeLessThanOrEqual(Math.floor(listings.length * 0.25));

    for (let start = 0; start <= listings.length - 4; start += 1) {
      const sponsoredInWindow = listings.slice(start, start + 4).filter((listing) => listing.is_sponsored).length;
      expect(sponsoredInWindow).toBeLessThanOrEqual(1);
    }

    const secondPass = adaptListingsForSearch([
      { id: "s1", title: "Sponsored 1", slug: "s1", is_sponsored: true, sponsored_weight: 0.7 },
      { id: "o1", title: "Organic 1", slug: "o1", is_sponsored: false },
      { id: "s2", title: "Sponsored 2", slug: "s2", is_sponsored: true, sponsored_weight: 0.9 },
      { id: "o2", title: "Organic 2", slug: "o2", is_sponsored: false },
      { id: "o3", title: "Organic 3", slug: "o3", is_sponsored: false },
      { id: "s3", title: "Sponsored 3", slug: "s3", is_sponsored: true, sponsored_weight: 1.2 },
      { id: "o4", title: "Organic 4", slug: "o4", is_sponsored: false },
      { id: "o5", title: "Organic 5", slug: "o5", is_sponsored: false },
    ] as never);

    expect(secondPass.map((listing) => listing.id)).toEqual(listings.map((listing) => listing.id));
  });

  it("returns non-empty deterministic results for all-sponsored arrays", () => {
    const listings = adaptListingsForSearch([
      { id: "s1", title: "Sponsored 1", slug: "s1", is_sponsored: true, sponsored_weight: 0.5 },
      { id: "s2", title: "Sponsored 2", slug: "s2", is_sponsored: true, sponsored_weight: 1.5 },
      { id: "s3", title: "Sponsored 3", slug: "s3", is_sponsored: true, sponsored_weight: 1.1 },
    ] as never);

    expect(listings.length).toBeGreaterThan(0);
    expect(listings[0]?.id).toBe("s2");

    const secondPass = adaptListingsForSearch([
      { id: "s1", title: "Sponsored 1", slug: "s1", is_sponsored: true, sponsored_weight: 0.5 },
      { id: "s2", title: "Sponsored 2", slug: "s2", is_sponsored: true, sponsored_weight: 1.5 },
      { id: "s3", title: "Sponsored 3", slug: "s3", is_sponsored: true, sponsored_weight: 1.1 },
    ] as never);

    expect(secondPass.map((listing) => listing.id)).toEqual(listings.map((listing) => listing.id));
  });

  it("keeps small arrays under fairness window valid and deterministic", () => {
    const listings = adaptListingsForSearch([
      { id: "s1", title: "Sponsored 1", slug: "s1", is_sponsored: true, sponsored_weight: 0.9 },
      { id: "o1", title: "Organic 1", slug: "o1", is_sponsored: false },
      { id: "o2", title: "Organic 2", slug: "o2", is_sponsored: false },
    ] as never);

    expect(listings).toHaveLength(3);
    expect(listings.map((listing) => listing.id)).toEqual(["o1", "o2", "s1"]);

    const secondPass = adaptListingsForSearch([
      { id: "s1", title: "Sponsored 1", slug: "s1", is_sponsored: true, sponsored_weight: 0.9 },
      { id: "o1", title: "Organic 1", slug: "o1", is_sponsored: false },
      { id: "o2", title: "Organic 2", slug: "o2", is_sponsored: false },
    ] as never);

    expect(secondPass.map((listing) => listing.id)).toEqual(listings.map((listing) => listing.id));
  });
});
