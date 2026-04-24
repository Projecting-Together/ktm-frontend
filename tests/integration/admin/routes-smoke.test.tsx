import { renderToStaticMarkup } from "react-dom/server";
import AdminLayout from "@/app/admin/layout";
import AdminPage from "@/app/admin/page";
import AdminAnalyticsPage from "@/app/admin/analytics/page";
import AdminTransactionsPage from "@/app/admin/transactions/page";
import { adminService } from "@/lib/admin/service";

const mockUseQuery = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockUseQueryClient = jest.fn(() => ({
  invalidateQueries: mockInvalidateQueries,
}));
const mockMutate = jest.fn();
const mockUseMutation = jest.fn(() => ({
  mutate: mockMutate,
}));

jest.mock("@/components/layout/Navbar", () => ({
  Navbar: () => <div data-testid="navbar" />,
}));

jest.mock("@tanstack/react-query", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useQueryClient: () => mockUseQueryClient(),
  useMutation: () => mockUseMutation(),
}));

jest.mock("@/lib/admin/service", () => ({
  adminService: {
    getAnalytics: jest.fn(),
  },
}));

describe("admin routes smoke", () => {
  beforeEach(() => {
    mockInvalidateQueries.mockReset();
    mockUseQueryClient.mockClear();
    mockMutate.mockReset();
    mockUseMutation.mockClear();
    mockUseQuery.mockReturnValue({
      data: {
        kpis: [
          { key: "totalListings", label: "Total Listings", value: 128, deltaPercent: 6.4 },
          { key: "pendingListings", label: "Pending Review", value: 14, deltaPercent: -3.2 },
        ],
        activities: [
          { id: "act-1", actor: "moderator@ktm.test", action: "Approved listing l2", createdAt: "2026-04-24T08:10:00.000Z" },
        ],
      },
      isLoading: false,
      isError: false,
    });
  });

  it("required admin navigation labels", () => {
    const html = renderToStaticMarkup(
      <AdminLayout>
        <div>Admin content</div>
      </AdminLayout>,
    );

    expect(html).toContain(">Dashboard<");
    expect(html).toContain('href="/admin"');
    expect(html).toContain(">Listing Management<");
    expect(html).toContain('href="/admin/listings"');
    expect(html).toContain(">Transactions<");
    expect(html).toContain('href="/admin/transactions"');
    expect(html).toContain(">User Management<");
    expect(html).toContain('href="/admin/users"');
    expect(html).toContain(">Analytics<");
    expect(html).toContain('href="/admin/analytics"');
  });

  it("transactions page renders heading", () => {
    const html = renderToStaticMarkup(<AdminTransactionsPage />);
    expect(html).toContain(">Transactions<");
  });

  it("dashboard summary and activity", () => {
    const html = renderToStaticMarkup(<AdminPage />);
    expect(html).toContain(">Dashboard Overview<");
    expect(html).toContain(">Recent Activity<");
    expect(html).toContain(">Approved listing l2<");
    expect(html).toContain(">128<");
    expect(html).toContain("Apr 24, 2026");
  });

  it("dashboard loading state", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const html = renderToStaticMarkup(<AdminPage />);
    expect(html).toContain(">Dashboard Overview<");
    expect(html).toContain(">Recent Activity<");
    expect(html).toContain("animate-pulse");
  });

  it("dashboard error state", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    const html = renderToStaticMarkup(<AdminPage />);
    expect(html).toContain(">Dashboard data unavailable<");
    expect(html).toContain(">Unable to load summary right now. Please try again.<");
  });

  it("charts and report export actions", () => {
    const getAnalyticsMock = adminService.getAnalytics as jest.Mock;
    getAnalyticsMock.mockResolvedValue([
      { date: "2026-04-22", listings: 5, transactions: 4, users: 4 },
      { date: "2026-04-23", listings: 8, transactions: 6, users: 9 },
      { date: "2026-04-24", listings: 7, transactions: 5, users: 6 },
    ]);

    mockUseQuery.mockImplementation(({ queryFn }: { queryFn: () => Promise<unknown> }) => {
      void queryFn();
      return {
        data: [
          { date: "2026-04-22", listings: 5, transactions: 4, users: 4 },
          { date: "2026-04-23", listings: 8, transactions: 6, users: 9 },
          { date: "2026-04-24", listings: 7, transactions: 5, users: 6 },
        ],
        isLoading: false,
        isError: false,
      };
    });

    const html = renderToStaticMarkup(<AdminAnalyticsPage />);
    expect(html).toContain(">Analytics Overview<");
    expect(html).toContain(">Listings Trend<");
    expect(html).toContain(">Users Trend<");
    expect(html).toContain(">Revenue Trend<");
    expect(html).toContain(">Export CSV<");
    expect(html).toContain(">Export PDF<");
    expect(getAnalyticsMock).toHaveBeenCalledWith({
      dateRange: "last-30-days",
      city: "all-cities",
      listingType: "all-types",
    });
  });
});
