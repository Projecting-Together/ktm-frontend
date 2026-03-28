import { mockListingItems, mockListingsPage1, mockRenter, mockOwner, mockAdmin, mockAdminAnalytics } from "@/test-utils/mockData";

jest.mock("@/lib/api/client", () => ({
  adminGetPendingListings: jest.fn(),
  adminApproveListing: jest.fn(),
  adminRejectListing: jest.fn(),
  adminSuspendUser: jest.fn(),
  adminGetAnalytics: jest.fn(),
  adminGetAuditLog: jest.fn(),
  adminGetUsers: jest.fn(),
  clearTokens: jest.fn(),
  initializeAuth: jest.fn(),
}));

import * as apiClient from "@/lib/api/client";
const mockGetPending = apiClient.adminGetPendingListings as jest.MockedFunction<typeof apiClient.adminGetPendingListings>;
const mockApprove = apiClient.adminApproveListing as jest.MockedFunction<typeof apiClient.adminApproveListing>;
const mockReject = apiClient.adminRejectListing as jest.MockedFunction<typeof apiClient.adminRejectListing>;
const mockSuspend = apiClient.adminSuspendUser as jest.MockedFunction<typeof apiClient.adminSuspendUser>;
const mockAnalytics = apiClient.adminGetAnalytics as jest.MockedFunction<typeof apiClient.adminGetAnalytics>;

describe("Admin API client", () => {
  beforeEach(() => jest.clearAllMocks());

  it("adminGetPendingListings returns pending listings queue", async () => {
    const pendingItems = mockListingItems.map(l => ({ ...l, status: "pending" as const }));
    const paginatedPending = { items: pendingItems, total: pendingItems.length, page: 1, page_size: 20, total_pages: 1, has_next: false, has_prev: false };
    mockGetPending.mockResolvedValueOnce({ data: paginatedPending, error: null });
    const result = await apiClient.adminGetPendingListings();
    expect(result.data?.items).toHaveLength(pendingItems.length);
    expect(result.error).toBeNull();
  });

  it("adminApproveListing approves a pending listing", async () => {
    const approved = { ...mockListingItems[0], status: "active" as const };
    mockApprove.mockResolvedValueOnce({ data: approved, error: null });
    const result = await apiClient.adminApproveListing("listing-thamel-001");
    expect(result.data?.status).toBe("active");
    expect(result.error).toBeNull();
  });

  it("adminRejectListing rejects a pending listing with reason", async () => {
    const rejected = { ...mockListingItems[0], status: "rejected" as const };
    mockReject.mockResolvedValueOnce({ data: rejected, error: null });
    const result = await apiClient.adminRejectListing("listing-thamel-001", "Insufficient images");
    expect(result.data?.status).toBe("rejected");
    expect(result.error).toBeNull();
  });

  it("adminSuspendUser suspends a user account", async () => {
    const suspended = { ...mockRenter, status: "suspended" as const };
    mockSuspend.mockResolvedValueOnce({ data: suspended, error: null });
    const result = await apiClient.adminSuspendUser("usr-renter-001", "Spam activity");
    expect(result.data?.status).toBe("suspended");
    expect(result.error).toBeNull();
  });

  it("adminGetAnalytics returns platform overview stats", async () => {
    mockAnalytics.mockResolvedValueOnce({ data: mockAdminAnalytics, error: null });
    const result = await apiClient.adminGetAnalytics();
    expect(result.data?.total_listings).toBeGreaterThan(0);
    expect(result.data?.total_users).toBeGreaterThan(0);
    expect(result.data?.pending_listings).toBeGreaterThanOrEqual(0);
    expect(result.error).toBeNull();
  });

  it("admin operations return 403 for non-admin users", async () => {
    mockGetPending.mockResolvedValueOnce({
      data: null,
      error: { message: "Forbidden", status: 403 },
    });
    const result = await apiClient.adminGetPendingListings();
    expect(result.data).toBeNull();
    expect(result.error?.status).toBe(403);
  });

  it("adminApproveListing is called with correct listing ID", async () => {
    mockApprove.mockResolvedValueOnce({ data: mockListingItems[0], error: null });
    await apiClient.adminApproveListing("listing-thamel-001");
    expect(mockApprove).toHaveBeenCalledWith("listing-thamel-001");
  });
});
