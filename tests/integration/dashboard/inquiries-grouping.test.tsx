import React from "react";
import { render, screen, waitFor, within } from "@/test-utils/renderWithProviders";
import userEvent from "@testing-library/user-event";
import InquiriesPage from "@/app/dashboard/inquiries/page";
import DashboardOverviewClient from "@/app/dashboard/DashboardOverviewClient";
import { getMyInquiries, getMyListings } from "@/lib/api/client";
import { useFavorites } from "@/lib/hooks/useFavorites";
import dashboardInquiriesGroupingFixture from "@/test-utils/fixtures/tests/dashboard-inquiries-grouping.json";

jest.mock("@/lib/api/client", () => ({
  getMyInquiries: jest.fn(),
  getMyListings: jest.fn(),
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
const mockGetMyListings = getMyListings as jest.MockedFunction<typeof getMyListings>;
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
    mockGetMyInquiries.mockResolvedValueOnce(dashboardInquiriesGroupingFixture.getMyInquiriesResponse as never);

    const user = userEvent.setup();
    render(<InquiriesPage />);

    const groupHeading = await screen.findByRole("button", { name: /sunny 2bhk in thamel/i });
    const firstGroup = groupHeading.closest("section");
    expect(firstGroup).toBeInTheDocument();

    expect(within(firstGroup as HTMLElement).getByRole("img", { name: /sunny 2bhk in thamel/i })).toBeInTheDocument();
    expect(within(firstGroup as HTMLElement).getByText("New")).toBeInTheDocument();
    expect(within(firstGroup as HTMLElement).getByText(/o\.\s*owner\s*•\s*2\s*inquiries/i)).toBeInTheDocument();
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

  it("shows owner expired/archived listings total as expired metric", async () => {
    mockGetMyListings.mockResolvedValueOnce({
      data: {
        page: 1,
        page_size: 1,
        total: 2,
        total_pages: 2,
        has_next: true,
        has_prev: false,
        items: [],
      },
      error: null,
    } as never);

    render(<DashboardOverviewClient />);

    const expiredTile = await screen.findByRole("link", { name: /expired listings/i });
    await waitFor(() => {
      expect(expiredTile).toHaveTextContent("2");
    });
    expect(mockGetMyListings).toHaveBeenCalledWith({ status: "archived", skip: 0, limit: 1 });
  });
});
