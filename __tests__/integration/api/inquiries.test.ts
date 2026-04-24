import { mockInquiries } from "@/test-utils/mockData";

jest.mock("@/lib/api/client", () => ({
  getMyInquiries: jest.fn(),
  getReceivedInquiries: jest.fn(),
  createInquiry: jest.fn(),
  replyToInquiry: jest.fn(),
  clearTokens: jest.fn(),
  initializeAuth: jest.fn(),
}));

import * as apiClient from "@/lib/api/client";
const mockGetMyInquiries = apiClient.getMyInquiries as jest.MockedFunction<typeof apiClient.getMyInquiries>;
const mockGetReceivedInquiries = apiClient.getReceivedInquiries as jest.MockedFunction<typeof apiClient.getReceivedInquiries>;
const mockCreateInquiry = apiClient.createInquiry as jest.MockedFunction<typeof apiClient.createInquiry>;

describe("Inquiries API client", () => {
  beforeEach(() => jest.clearAllMocks());

  it("getMyInquiries returns list of sent inquiries", async () => {
    mockGetMyInquiries.mockResolvedValueOnce({ data: mockInquiries, error: null });
    const result = await apiClient.getMyInquiries();
    expect(result.data).toHaveLength(mockInquiries.length);
    expect(result.error).toBeNull();
  });

  it("getMyInquiries returns empty array when no inquiries", async () => {
    mockGetMyInquiries.mockResolvedValueOnce({ data: [], error: null });
    const result = await apiClient.getMyInquiries();
    expect(result.data).toHaveLength(0);
  });

  it("createInquiry sends a message to the listing owner", async () => {
    const newInquiry = mockInquiries[0];
    mockCreateInquiry.mockResolvedValueOnce({ data: newInquiry, error: null });
    const result = await apiClient.createInquiry({
      listing_id: "listing-thamel-001",
      message: "Is this apartment still available? I am interested in viewing it.",
      move_in_date: "2026-04-01",
    });
    expect(result.data?.listing_id).toBe(newInquiry.listing_id);
    expect(result.error).toBeNull();
  });

  it("createInquiry returns error when message is too short", async () => {
    mockCreateInquiry.mockResolvedValueOnce({
      data: null,
      error: { message: "Message too short", status: 422 },
    });
    const result = await apiClient.createInquiry({
      listing_id: "listing-thamel-001",
      message: "Hi",
    });
    expect(result.data).toBeNull();
    expect(result.error?.status).toBe(422);
  });

  it("createInquiry is called with correct listing ID and payload", async () => {
    mockCreateInquiry.mockResolvedValueOnce({ data: mockInquiries[0], error: null });
    await apiClient.createInquiry({
      listing_id: "listing-thamel-001",
      message: "I would like to schedule a visit to this property.",
    });
    expect(mockCreateInquiry).toHaveBeenCalledWith(
      expect.objectContaining({
        listing_id: "listing-thamel-001",
        message: expect.stringContaining("visit"),
      })
    );
  });

  it("getMyInquiries returns error when not authenticated", async () => {
    mockGetMyInquiries.mockResolvedValueOnce({
      data: null,
      error: { message: "Unauthorized", status: 401 },
    });
    const result = await apiClient.getMyInquiries();
    expect(result.data).toBeNull();
    expect(result.error?.status).toBe(401);
  });
});
