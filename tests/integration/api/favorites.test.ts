import { mockFavorites } from "@/test-utils/mockData";

jest.mock("@/lib/api/client", () => ({
  getFavorites: jest.fn(),
  addFavorite: jest.fn(),
  removeFavorite: jest.fn(),
  clearTokens: jest.fn(),
  initializeAuth: jest.fn(),
}));

import * as apiClient from "@/lib/api/client";
const mockGetFavorites = apiClient.getFavorites as jest.MockedFunction<typeof apiClient.getFavorites>;
const mockAddFavorite = apiClient.addFavorite as jest.MockedFunction<typeof apiClient.addFavorite>;
const mockRemoveFavorite = apiClient.removeFavorite as jest.MockedFunction<typeof apiClient.removeFavorite>;

describe("Favorites API client", () => {
  beforeEach(() => jest.clearAllMocks());

  it("getFavorites returns user favorites list", async () => {
    mockGetFavorites.mockResolvedValueOnce({ data: mockFavorites, error: null });
    const result = await apiClient.getFavorites();
    expect(result.data).toHaveLength(mockFavorites.length);
    expect(result.error).toBeNull();
  });

  it("getFavorites returns empty array when no favorites", async () => {
    mockGetFavorites.mockResolvedValueOnce({ data: [], error: null });
    const result = await apiClient.getFavorites();
    expect(result.data).toHaveLength(0);
  });

  it("addFavorite adds a listing to favorites", async () => {
    const newFav = mockFavorites[0];
    mockAddFavorite.mockResolvedValueOnce({ data: newFav, error: null });
    const result = await apiClient.addFavorite("listing-thamel-001");
    expect(result.data?.listing_id).toBe(newFav.listing_id);
    expect(result.error).toBeNull();
  });

  it("removeFavorite removes a listing from favorites", async () => {
    mockRemoveFavorite.mockResolvedValueOnce({ data: null, error: null });
    const result = await apiClient.removeFavorite("listing-thamel-001");
    expect(result.error).toBeNull();
    expect(mockRemoveFavorite).toHaveBeenCalledWith("listing-thamel-001");
  });

  it("addFavorite returns error when already favorited", async () => {
    mockAddFavorite.mockResolvedValueOnce({
      data: null,
      error: { message: "Already in favorites", status: 409 },
    });
    const result = await apiClient.addFavorite("listing-thamel-001");
    expect(result.data).toBeNull();
    expect(result.error?.status).toBe(409);
  });

  it("getFavorites returns error when not authenticated", async () => {
    mockGetFavorites.mockResolvedValueOnce({
      data: null,
      error: { message: "Unauthorized", status: 401 },
    });
    const result = await apiClient.getFavorites();
    expect(result.data).toBeNull();
    expect(result.error?.status).toBe(401);
  });
});
