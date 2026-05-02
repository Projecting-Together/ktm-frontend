import React from "react";
import { render, screen } from "@/test-utils/renderWithProviders";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuthStore } from "@/lib/stores/authStore";

let mockPathname = "/";

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

jest.mock("@/lib/stores/authStore", () => ({
  useAuthStore: jest.fn(),
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;

describe("Public navigation links", () => {
  beforeEach(() => {
    mockPathname = "/";
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
      upgradeToAgent: jest.fn(),
    });
  });

  it("shows Listings, News, About, and Contact links in the top navigation", () => {
    render(<Navbar />);

    expect(screen.getByRole("link", { name: "Listings" })).toHaveAttribute("href", "/listings");
    expect(screen.getByRole("link", { name: "News" })).toHaveAttribute("href", "/news");
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
  });

  it("highlights the active top navigation link for current route", () => {
    mockPathname = "/news/latest";
    render(<Navbar />);

    expect(screen.getByRole("link", { name: "News" })).toHaveClass("text-accent");
  });

  it("shows aligned explore, company, and legal links in footer", () => {
    render(<Footer />);

    expect(screen.getByRole("link", { name: "Listings" })).toHaveAttribute("href", "/listings");
    expect(screen.getByRole("link", { name: "News" })).toHaveAttribute("href", "/news");
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms");
  });
});
