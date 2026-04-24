import React from "react";
import { fireEvent, render, screen, waitFor } from "@/test-utils/renderWithProviders";
import { Navbar } from "@/components/layout/Navbar";
import { useAuthStore } from "@/lib/stores/authStore";

const mockPush = jest.fn();
let mockPurposeParam: string | null = null;

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    get: (key: string) => (key === "purpose" ? mockPurposeParam : null),
  }),
}));

jest.mock("@/lib/stores/authStore", () => ({
  useAuthStore: jest.fn(),
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;

describe("Navbar listing entry capability gating", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockPurposeParam = null;
  });

  it("shows upgrade modal for capped owner and keeps user in place on cancel", async () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: "u1",
        email: "owner@example.com",
        role: "owner",
        profile: { first_name: "Owner" },
        stats: { active_listings: 2 },
      },
      upgradeToAgent: jest.fn(),
    });

    render(<Navbar />);
    fireEvent.click(screen.getByRole("button", { name: /post listing/i }));

    expect(screen.getByText(/upgrade to agent/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByText(/upgrade to agent/i)).not.toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("upgrades and continues to listing creation on confirm", async () => {
    mockPurposeParam = "sale";

    const upgradeToAgent = jest.fn().mockResolvedValue(undefined);
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: "u1",
        email: "owner@example.com",
        role: "owner",
        profile: { first_name: "Owner" },
        stats: { active_listings: 2 },
      },
      upgradeToAgent,
    });

    render(<Navbar />);
    fireEvent.click(screen.getByRole("button", { name: /post listing/i }));
    fireEvent.click(screen.getByRole("button", { name: /upgrade and continue/i }));

    await waitFor(() => {
      expect(upgradeToAgent).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/manage/listings/new?purpose=sale");
    });
  });

  it("navigates directly with sale purpose when buy context is active", () => {
    mockPurposeParam = "sale";

    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: "u1",
        email: "owner@example.com",
        role: "owner",
        profile: { first_name: "Owner" },
        stats: { active_listings: 1 },
      },
      upgradeToAgent: jest.fn(),
    });

    render(<Navbar />);
    fireEvent.click(screen.getByRole("button", { name: /post listing/i }));

    expect(mockPush).toHaveBeenCalledWith("/manage/listings/new?purpose=sale");
    expect(screen.queryByText(/upgrade to agent/i)).not.toBeInTheDocument();
  });

  it("keeps default listing route when purpose context is invalid", () => {
    mockPurposeParam = "invalid-value";

    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: "u1",
        email: "owner@example.com",
        role: "owner",
        profile: { first_name: "Owner" },
        stats: { active_listings: 1 },
      },
      upgradeToAgent: jest.fn(),
    });

    render(<Navbar />);
    fireEvent.click(screen.getByRole("button", { name: /post listing/i }));

    expect(mockPush).toHaveBeenCalledWith("/manage/listings/new");
    expect(screen.queryByText(/upgrade to agent/i)).not.toBeInTheDocument();
  });
});
