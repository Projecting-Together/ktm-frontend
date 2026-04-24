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
      "Owner market listing submitted to moderation queue as pending review.",
    );
  });

  it("manage market listing page allows trusted agent submit path per contract", () => {
    (useAuthStore as jest.Mock).mockReturnValue({ user: { role: "agent" } });

    render(<ManageMarketListingPage />);

    fireEvent.click(screen.getByRole("button", { name: "Submit For Review" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Trusted agent published the approved market listing to public market surfaces.",
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
});
