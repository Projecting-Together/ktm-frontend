import React from "react";
import { render, screen, waitFor, within } from "@/test-utils/renderWithProviders";
import userEvent from "@testing-library/user-event";
import InquiriesPage from "@/app/dashboard/inquiries/page";
import DashboardOverviewClient from "@/app/dashboard/DashboardOverviewClient";
import { getMyInquiries, getListings } from "@/lib/api/client";
import { useFavorites } from "@/lib/hooks/useFavorites";

jest.mock("@/lib/api/client", () => ({
  getMyInquiries: jest.fn(),
  getListings: jest.fn(),
}));

jest.mock("@/lib/hooks/useFavorites", () => ({
  useFavorites: jest.fn(),
}));

jest.mock("@/lib/stores/authStore", () => ({
  useAuthStore: () => ({
    user: {
      profile: {
        first_name: "Ram",
      },
    },
  }),
}));

const mockGetMyInquiries = getMyInquiries as jest.MockedFunction<typeof getMyInquiries>;
const mockGetListings = getListings as jest.MockedFunction<typeof getListings>;
const mockUseFavorites = useFavorites as jest.MockedFunction<typeof useFavorites>;

describe("Dashboard inquiries grouping", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFavorites.mockReturnValue({
      data: [],
      isLoading: false,
    } as never);
  });

  it("groups inquiries by property and supports collapse with property context", async () => {
    mockGetMyInquiries.mockResolvedValueOnce({
      data: [
        {
          id: "inq-100",
          listing_id: "lst-100",
          sender_id: "usr-renter-001",
          owner_id: "usr-owner-001",
          message: "Is this available this weekend?",
          status: "pending",
          owner_reply: null,
          created_at: "2026-04-24T10:00:00Z",
          updated_at: "2026-04-24T10:00:00Z",
          listing: {
            id: "lst-100",
            slug: "thamel-2bhk",
            title: "Sunny 2BHK in Thamel",
            status: "active",
            currency: "NPR",
            images: [{ id: "img-1", listing_id: "lst-100", image_url: "/demo1.jpg", sort_order: 0, is_cover: true }],
            created_at: "2026-04-20T10:00:00Z",
          },
        },
        {
          id: "inq-101",
          listing_id: "lst-100",
          sender_id: "usr-renter-001",
          owner_id: "usr-owner-001",
          message: "Can I schedule a viewing on Sunday?",
          status: "replied",
          owner_reply: "Yes, Sunday works.",
          created_at: "2026-04-24T11:00:00Z",
          updated_at: "2026-04-24T12:00:00Z",
          listing: {
            id: "lst-100",
            slug: "thamel-2bhk",
            title: "Sunny 2BHK in Thamel",
            status: "active",
            currency: "NPR",
            images: [{ id: "img-1", listing_id: "lst-100", image_url: "/demo1.jpg", sort_order: 0, is_cover: true }],
            created_at: "2026-04-20T10:00:00Z",
          },
        },
        {
          id: "inq-102",
          listing_id: "lst-200",
          sender_id: "usr-renter-001",
          owner_id: "usr-agent-001",
          message: "Is parking included?",
          status: "replied",
          owner_reply: "Yes, one covered slot.",
          created_at: "2026-04-23T10:00:00Z",
          updated_at: "2026-04-23T12:00:00Z",
          listing: {
            id: "lst-200",
            slug: "patan-flat",
            title: "Family Flat in Patan",
            status: "active",
            currency: "NPR",
            images: [{ id: "img-2", listing_id: "lst-200", image_url: "/demo2.jpg", sort_order: 0, is_cover: true }],
            created_at: "2026-04-18T10:00:00Z",
          },
        },
      ],
      error: null,
    } as never);

    const user = userEvent.setup();
    render(<InquiriesPage />);

    const groupHeading = await screen.findByRole("button", { name: /sunny 2bhk in thamel/i });
    const firstGroup = groupHeading.closest("section");
    expect(firstGroup).toBeInTheDocument();

    expect(within(firstGroup as HTMLElement).getByRole("img", { name: /sunny 2bhk in thamel/i })).toBeInTheDocument();
    expect(within(firstGroup as HTMLElement).getByText("New")).toBeInTheDocument();
    expect(within(firstGroup as HTMLElement).getByText(/o\.\s*owner/i)).toBeInTheDocument();
    expect(within(firstGroup as HTMLElement).getByText(/2 inquiries/i)).toBeInTheDocument();
    expect(within(firstGroup as HTMLElement).getByText(/is this available this weekend/i)).toBeInTheDocument();

    await user.click(groupHeading);
    expect(within(firstGroup as HTMLElement).queryByText(/is this available this weekend/i)).not.toBeInTheDocument();
    expect(within(firstGroup as HTMLElement).queryByText(/can i schedule a viewing on sunday/i)).not.toBeInTheDocument();
  });
});

describe("Dashboard overview expired listings metric", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFavorites.mockReturnValue({
      data: [{ listing_id: "fav-1" }],
      isLoading: false,
    } as never);
  });

  it("shows archived listings count as expired metric", async () => {
    mockGetListings.mockResolvedValueOnce({
      data: {
        items: [
          {
            id: "l1",
            slug: "listing-1",
            title: "Archived 1",
            status: "archived",
            currency: "NPR",
            images: [],
            created_at: "2026-01-01T00:00:00Z",
          },
          {
            id: "l2",
            slug: "listing-2",
            title: "Active",
            status: "active",
            currency: "NPR",
            images: [],
            created_at: "2026-01-01T00:00:00Z",
          },
          {
            id: "l3",
            slug: "listing-3",
            title: "Archived 2",
            status: "archived",
            currency: "NPR",
            images: [],
            created_at: "2026-01-01T00:00:00Z",
          },
        ],
      },
      error: null,
    } as never);

    render(<DashboardOverviewClient />);

    const expiredTile = await screen.findByRole("link", { name: /expired listings/i });
    await waitFor(() => {
      expect(expiredTile).toHaveTextContent("2");
    });
  });
});
