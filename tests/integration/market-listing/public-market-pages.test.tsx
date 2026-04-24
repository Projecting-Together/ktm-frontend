import { renderToStaticMarkup } from "react-dom/server";
import { fireEvent, render, screen } from "@testing-library/react";
import PublicMarketListingPage from "@/app/(public)/market-listing/page";
import PublicMarketListingDetailPage from "@/app/(public)/market-listing/[slug]/page";
import ManageMarketListingPage from "@/app/manage/market-listing/page";
import AdminMarketListingPage from "@/app/admin/market-listing/page";
import { getMarketListingDetail, getMarketListings } from "@/lib/api/client";
import { useMarketListings } from "@/lib/hooks/useMarketListings";
import { notFound } from "next/navigation";

jest.mock("@/lib/api/client", () => ({
  getMarketListings: jest.fn(),
  getMarketListingDetail: jest.fn(),
}));

jest.mock("@/lib/hooks/useMarketListings", () => ({
  useMarketListings: jest.fn(),
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
    (notFound as jest.Mock).mockClear();
    (useMarketListings as jest.Mock).mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isError: false,
    });
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

    expect(getMarketListings).toHaveBeenCalledWith({ page: 1, limit: 12 });
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
      "Owner market listing submitted to moderation queue as pending review.",
    );
  });

  it("admin market listing page supports reject action with reason and feedback", () => {
    render(<AdminMarketListingPage />);

    fireEvent.change(screen.getByLabelText("Rejection reason"), {
      target: { value: "Missing market comps." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    expect(screen.getByRole("status")).toHaveTextContent("Rejected listing with reason: Missing market comps.");
    expect(screen.getByText("Latest rejection reason: Missing market comps.")).toBeInTheDocument();
  });
});
