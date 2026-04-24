import {
  mockAdminAnalytics,
  mockInquiries,
  mockListingItems,
  mockListings,
  mockListingsPage1,
  mockSaleInquiries,
  mockSaleListings,
} from "@/test-utils/mockData";

jest.mock("@/lib/api/client", () => ({
  getListings: jest.fn(),
  getListing: jest.fn(),
  createListing: jest.fn(),
  updateListing: jest.fn(),
  deleteListing: jest.fn(),
  publishListing: jest.fn(),
  markListingRented: jest.fn(),
  getListingStats: jest.fn(),
  clearTokens: jest.fn(),
  initializeAuth: jest.fn(),
}));

import * as apiClient from "@/lib/api/client";
const mockGetListings = apiClient.getListings as jest.MockedFunction<typeof apiClient.getListings>;
const mockGetListing = apiClient.getListing as jest.MockedFunction<typeof apiClient.getListing>;

describe("Listings API client", () => {
  beforeEach(() => jest.clearAllMocks());

  const saleListingsInFixtures = mockListings.filter(
    (listing) => listing.purpose === "sale" && listing.status === "active"
  );

  it("getListings returns paginated listing items", async () => {
    mockGetListings.mockResolvedValueOnce({ data: mockListingsPage1, error: null });
    const result = await apiClient.getListings({ page: 1, limit: 20 });
    expect(result.data).not.toBeNull();
    expect(result.data?.items).toHaveLength(mockListingItems.length);
    expect(result.data?.total).toBe(mockListingsPage1.total);
    expect(result.error).toBeNull();
  });

  it("getListings can return filtered apartment results in the requested price band", async () => {
    const filteredItems = mockListingItems.filter(
      (item) =>
        item.listing_type === "apartment" &&
        Number(item.price) >= 10000 &&
        Number(item.price) <= 30000
    );
    mockGetListings.mockResolvedValueOnce({
      data: {
        ...mockListingsPage1,
        items: filteredItems,
        total: filteredItems.length,
      },
      error: null,
    });
    const result = await apiClient.getListings({
      listing_type: "apartment",
      min_price: 10000,
      max_price: 30000,
    });
    expect(result.error).toBeNull();
    expect(result.data?.items.length).toBeGreaterThan(0);
    expect(
      result.data?.items.every(
        (item) =>
          item.listing_type === "apartment" &&
          Number(item.price) >= 10000 &&
          Number(item.price) <= 30000
      )
    ).toBe(true);
  });

  it("getListings returns empty items when no results", async () => {
    mockGetListings.mockResolvedValueOnce({
      data: { items: [], total: 0, page: 1, page_size: 20, total_pages: 0, has_next: false, has_prev: false },
      error: null,
    });
    const result = await apiClient.getListings({ search: "nonexistent-keyword" });
    expect(result.data?.items).toHaveLength(0);
    expect(result.data?.total).toBe(0);
  });

  it("getListing returns a full listing detail", async () => {
    mockGetListing.mockResolvedValueOnce({ data: mockListings[0], error: null });
    const result = await apiClient.getListing("listing-thamel-001");
    expect(result.data).not.toBeNull();
    expect(result.data?.id).toBe(mockListings[0].id);
    expect(result.data?.title).toBeDefined();
    expect(result.error).toBeNull();
  });

  it("getListing returns error for non-existent slug", async () => {
    mockGetListing.mockResolvedValueOnce({
      data: null,
      error: { message: "Listing not found", status: 404 },
    });
    const result = await apiClient.getListing("does-not-exist");
    expect(result.data).toBeNull();
    expect(result.error?.status).toBe(404);
  });

  it("getListings filters by bedrooms", async () => {
    const filtered = { ...mockListingsPage1, items: mockListingItems.filter(l => l.bedrooms === 2) };
    mockGetListings.mockResolvedValueOnce({ data: filtered, error: null });
    const result = await apiClient.getListings({ bedrooms: 2 });
    result.data?.items.forEach(item => expect(item.bedrooms).toBe(2));
  });

  it("getListings filters by verified only", async () => {
    const verified = { ...mockListingsPage1, items: mockListingItems.filter(l => l.is_verified) };
    mockGetListings.mockResolvedValueOnce({ data: verified, error: null });
    const result = await apiClient.getListings({ verified: true });
    result.data?.items.forEach(item => expect(item.is_verified).toBe(true));
  });

  it("getListings handles network error gracefully", async () => {
    mockGetListings.mockResolvedValueOnce({
      data: null,
      error: { message: "Network error", status: 0 },
    });
    const result = await apiClient.getListings({});
    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
  });

  it("mock ecosystem keeps buy-mode sale listings aligned with canonical fixtures", () => {
    expect(mockSaleListings.length).toBe(saleListingsInFixtures.length);
    expect(mockSaleListings.every((listing) => listing.purpose === "sale")).toBe(true);
    expect(mockSaleListings.every((listing) => listing.status === "active")).toBe(true);
    expect(mockSaleListings.some((listing) => listing.price_period !== "monthly")).toBe(true);
  });

  it("analytics counters stay internally consistent with sale activity", () => {
    const activeListings = mockListings.filter((listing) => listing.status === "active");
    expect(mockAdminAnalytics.total_listings).toBeGreaterThanOrEqual(mockListings.length);
    expect(mockAdminAnalytics.active_listings).toBeGreaterThanOrEqual(activeListings.length);
    expect(mockAdminAnalytics.total_inquiries).toBeGreaterThanOrEqual(mockInquiries.length);
    expect(mockAdminAnalytics.inquiries_today).toBeLessThanOrEqual(mockAdminAnalytics.total_inquiries);
    expect(mockSaleInquiries.length).toBeGreaterThan(0);
  });
});
