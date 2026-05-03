import React from "react";
import { render, screen } from "@/test-utils/renderWithProviders";
import { NewListingRouteGate } from "@/components/listings/NewListingRouteGate";
import { useAuthStore } from "@/lib/stores/authStore";

jest.mock("@/components/listings/ListingForm", () => ({
  ListingForm: () => <div data-testid="listing-form">ListingForm</div>,
}));

jest.mock("@/lib/stores/authStore", () => ({
  useAuthStore: jest.fn(),
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;

describe("NewListingRouteGate", () => {
  beforeEach(() => {
    mockUseAuthStore.mockReset();
  });

  it("shows permission message when account is not allowed to create listings", () => {
    mockUseAuthStore.mockReturnValue({
      user: {
        id: "u1",
        email: "a@b.com",
        role: "user",
        status: "suspended",
        is_verified: true,
        created_at: "",
      },
    });

    render(<NewListingRouteGate initialPurpose="rent" />);

    expect(screen.getByText(/do not have permission/i)).toBeInTheDocument();
  });

  it("shows free listing limit when member user is at cap", () => {
    mockUseAuthStore.mockReturnValue({
      user: {
        id: "u1",
        email: "a@b.com",
        role: "user",
        status: "active",
        is_verified: true,
        created_at: "",
        stats: { active_listings: 2 },
      },
    });

    render(<NewListingRouteGate initialPurpose="rent" />);

    expect(screen.getByText(/free listing limit/i)).toBeInTheDocument();
  });

  it("renders listing form when member user is below cap", () => {
    mockUseAuthStore.mockReturnValue({
      user: {
        id: "u1",
        email: "a@b.com",
        role: "user",
        status: "active",
        is_verified: true,
        created_at: "",
        stats: { active_listings: 1 },
      },
    });

    render(<NewListingRouteGate initialPurpose="rent" />);

    expect(screen.getByTestId("listing-form")).toBeInTheDocument();
  });

  it("renders listing form for admin regardless of active listing count", () => {
    mockUseAuthStore.mockReturnValue({
      user: {
        id: "a1",
        email: "admin@example.com",
        role: "admin",
        status: "active",
        is_verified: true,
        created_at: "",
        stats: { active_listings: 50 },
      },
    });

    render(<NewListingRouteGate initialPurpose="sale" />);

    expect(screen.getByTestId("listing-form")).toBeInTheDocument();
  });
});
