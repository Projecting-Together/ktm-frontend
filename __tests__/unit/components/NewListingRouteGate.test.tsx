import React from "react";
import { fireEvent, render, screen } from "@/test-utils/renderWithProviders";
import { NewListingRouteGate } from "@/components/listings/NewListingRouteGate";
import { useAuthStore } from "@/lib/stores/authStore";

jest.mock("@/lib/stores/authStore", () => ({
  useAuthStore: jest.fn(),
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;

describe("NewListingRouteGate", () => {
  beforeEach(() => {
    mockUseAuthStore.mockReset();
  });

  it("keeps user on current page and shows guidance after canceling upgrade", () => {
    mockUseAuthStore.mockReturnValue({
      user: {
        id: "u-owner-1",
        email: "owner@example.com",
        role: "owner",
        profile: { first_name: "Owner" },
        stats: { active_listings: 2 },
      },
      upgradeToAgent: jest.fn(),
    });

    render(<NewListingRouteGate initialPurpose="sale" />);

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText(/upgrade canceled\./i)).toBeInTheDocument();
    expect(
      screen.getByText(/upgrade from your account settings when you are ready to publish another listing\./i)
    ).toBeInTheDocument();
  });
});
