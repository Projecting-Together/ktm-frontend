import React from "react";
import { render, screen, waitFor } from "@/test-utils/renderWithProviders";
import userEvent from "@testing-library/user-event";
import LeadInboxInquiriesPage from "@/app/dashboard/leads/inquiries/page";
import { getReceivedInquiries } from "@/lib/api/client";
import { mockInquiries } from "@/test-utils/mockData";

jest.mock("@/lib/api/client", () => ({
  getReceivedInquiries: jest.fn(),
  replyToInquiry: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockGetReceivedInquiries = getReceivedInquiries as jest.MockedFunction<typeof getReceivedInquiries>;

describe("Manage inquiries page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows purpose chips and filters inbox rows by selected purpose", async () => {
    mockGetReceivedInquiries.mockResolvedValueOnce({
      data: [
        {
          ...mockInquiries[0],
          listing: {
            ...mockInquiries[0].listing!,
            purpose: "rent",
          },
        },
        {
          ...mockInquiries[1],
          listing: {
            ...mockInquiries[1].listing!,
            purpose: "sale",
          },
        },
      ],
      error: null,
    });

    const user = userEvent.setup();
    render(<LeadInboxInquiriesPage />);

    expect(await screen.findByRole("button", { name: /all leads/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /rental leads/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sale leads/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(mockInquiries[0].message)).toBeInTheDocument();
      expect(screen.getByText(mockInquiries[1].message)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /rental leads/i }));
    expect(screen.getByText(mockInquiries[0].message)).toBeInTheDocument();
    expect(screen.queryByText(mockInquiries[1].message)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /sale leads/i }));
    expect(screen.getByText(mockInquiries[1].message)).toBeInTheDocument();
    expect(screen.queryByText(mockInquiries[0].message)).not.toBeInTheDocument();
  });

  it("renders visible purpose labels for inquiry rows", async () => {
    mockGetReceivedInquiries.mockResolvedValueOnce({
      data: [
        {
          ...mockInquiries[0],
          listing: {
            ...mockInquiries[0].listing!,
            purpose: "rent",
          },
        },
        {
          ...mockInquiries[1],
          listing: {
            ...mockInquiries[1].listing!,
            purpose: "sale",
          },
        },
      ],
      error: null,
    });

    render(<LeadInboxInquiriesPage />);

    expect(await screen.findByText("Rental Lead")).toBeInTheDocument();
    expect(screen.getByText("Sale Lead")).toBeInTheDocument();
  });
});
