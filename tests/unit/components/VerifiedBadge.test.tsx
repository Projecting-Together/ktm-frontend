import React from "react";
import { render, screen } from "@/test-utils/renderWithProviders";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";

// VerifiedBadge always renders (caller is responsible for conditional rendering)
// Props: size ("sm" | "md" | "lg"), showLabel (boolean), className

describe("VerifiedBadge", () => {
  it("renders without crashing", () => {
    const { container } = render(<VerifiedBadge />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders Verified text by default (showLabel=true)", () => {
    render(<VerifiedBadge />);
    expect(screen.getByText(/verified/i)).toBeInTheDocument();
  });

  it("hides label when showLabel=false", () => {
    render(<VerifiedBadge showLabel={false} />);
    expect(screen.queryByText(/verified/i)).not.toBeInTheDocument();
  });

  it("renders with size=sm without crashing", () => {
    const { container } = render(<VerifiedBadge size="sm" />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders with size=md without crashing", () => {
    const { container } = render(<VerifiedBadge size="md" />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders with size=lg without crashing", () => {
    const { container } = render(<VerifiedBadge size="lg" />);
    expect(container.firstChild).not.toBeNull();
  });

  it("applies custom className", () => {
    const { container } = render(<VerifiedBadge className="test-class" />);
    expect(container.firstChild).toHaveClass("test-class");
  });

  it("renders a ShieldCheck icon (svg)", () => {
    const { container } = render(<VerifiedBadge />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
  });
});
