import React from "react";
import { fireEvent, render, screen } from "@/test-utils/renderWithProviders";
import { Navbar } from "@/components/layout/Navbar";
import { useAuthStore } from "@/lib/stores/authStore";
import { toast } from "sonner";

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

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
  },
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockToastError = toast.error as jest.Mock;

function mockAuth(overrides: Partial<ReturnType<typeof useAuthStore>> & Record<string, unknown>) {
  const base = {
    isAuthenticated: true,
    user: {
      id: "u1",
      email: "user@example.com",
      role: "user" as const,
      profile: { first_name: "Test" },
      stats: { active_listings: 1 },
    },
    canCreateListing: () => true,
    ...overrides,
  };
  mockUseAuthStore.mockReturnValue(base);
}

describe("Navbar listing entry capability gating", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockPurposeParam = null;
    mockToastError.mockReset();
  });

  it("shows toast when default user exceeds free listing cap", () => {
    mockAuth({
      user: {
        id: "u1",
        email: "user@example.com",
        role: "user",
        profile: { first_name: "User" },
        stats: { active_listings: 2 },
      },
      canCreateListing: () => true,
    });

    render(<Navbar />);
    fireEvent.click(screen.getByRole("button", { name: /post listing/i }));

    expect(mockToastError).toHaveBeenCalledWith(expect.stringMatching(/listing limit/i));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("navigates directly with sale purpose when buy context is active", () => {
    mockPurposeParam = "sale";

    mockAuth({
      user: {
        id: "u1",
        email: "user@example.com",
        role: "user",
        profile: { first_name: "User" },
        stats: { active_listings: 1 },
      },
      canCreateListing: () => true,
    });

    render(<Navbar />);
    fireEvent.click(screen.getByRole("button", { name: /post listing/i }));

    expect(mockPush).toHaveBeenCalledWith("/dashboard/listings/new?purpose=sale");
  });

  it("keeps default listing route when purpose context is invalid", () => {
    mockPurposeParam = "invalid-value";

    mockAuth({
      user: {
        id: "u1",
        email: "user@example.com",
        role: "user",
        profile: { first_name: "User" },
        stats: { active_listings: 1 },
      },
      canCreateListing: () => true,
    });

    render(<Navbar />);
    fireEvent.click(screen.getByRole("button", { name: /post listing/i }));

    expect(mockPush).toHaveBeenCalledWith("/dashboard/listings/new");
  });

  it("allows users to enter listing flow below cap", () => {
    mockAuth({
      user: {
        id: "u-renter-1",
        email: "member@example.com",
        role: "user",
        profile: { first_name: "Member" },
        stats: { active_listings: 1 },
      },
      canCreateListing: () => true,
    });

    render(<Navbar />);
    fireEvent.click(screen.getByRole("button", { name: /post listing/i }));

    expect(mockPush).toHaveBeenCalledWith("/dashboard/listings/new");
  });

  it("blocks continuation when active listing count is unavailable for default users", () => {
    mockAuth({
      user: {
        id: "u-renter-2",
        email: "member2@example.com",
        role: "user",
        profile: { first_name: "Member" },
      },
      canCreateListing: () => true,
    });

    render(<Navbar />);
    fireEvent.click(screen.getByRole("button", { name: /post listing/i }));

    expect(mockPush).not.toHaveBeenCalled();
    expect(mockToastError).toHaveBeenCalledWith(expect.stringMatching(/couldn't verify your active listings/i));
  });

  it("allows admin to post without listing stats", () => {
    mockAuth({
      user: {
        id: "adm",
        email: "admin@example.com",
        role: "admin",
        profile: { first_name: "Admin" },
      },
      canCreateListing: () => true,
    });

    render(<Navbar />);
    fireEvent.click(screen.getByRole("button", { name: /post listing/i }));

    expect(mockPush).toHaveBeenCalledWith("/dashboard/listings/new");
  });
});
