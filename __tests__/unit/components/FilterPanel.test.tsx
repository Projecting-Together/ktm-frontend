import React from "react";
import { render, screen, fireEvent } from "@/test-utils/renderWithProviders";
import { FilterPanel } from "@/components/search/FilterPanel";

describe("FilterPanel", () => {
  it("renders without crashing", () => {
    const { container } = render(<FilterPanel />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders all property type buttons", () => {
    render(<FilterPanel />);
    expect(screen.getByRole("button", { name: /apartment/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /room/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /house/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /studio/i })).toBeInTheDocument();
  });

  it("does not render a neighborhood filter section", () => {
    render(<FilterPanel />);
    expect(screen.queryByText(/neighborhood/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^thamel$/i })).not.toBeInTheDocument();
  });

  it("renders price range slider and min/max inputs", () => {
    render(<FilterPanel />);
    expect(screen.getByRole("slider", { name: /price range/i })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: /minimum price/i })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: /maximum price/i })).toBeInTheDocument();
  });

  it("renders bedroom count buttons", () => {
    render(<FilterPanel />);
    expect(screen.getByRole("button", { name: /^1$/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^2$/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^3$/ })).toBeInTheDocument();
  });

  it("renders furnishing radio labels", () => {
    render(<FilterPanel />);
    expect(screen.getByText(/fully furnished/i)).toBeInTheDocument();
    expect(screen.getByText(/semi furnished/i)).toBeInTheDocument();
    expect(screen.getByText(/unfurnished/i)).toBeInTheDocument();
  });

  it("renders verified listings switch", () => {
    render(<FilterPanel />);
    // FilterPanel may have multiple switches (verified, parking, pet-friendly)
    const switches = screen.getAllByRole("switch");
    expect(switches.length).toBeGreaterThan(0);
  });

  it("renders parking and pet-friendly toggles", () => {
    render(<FilterPanel />);
    expect(screen.getByText(/parking/i)).toBeInTheDocument();
    expect(screen.getByText(/pet/i)).toBeInTheDocument();
  });

  it("clicking apartment type button does not throw", () => {
    render(<FilterPanel />);
    const btn = screen.getByRole("button", { name: /^apartment$/i });
    expect(() => fireEvent.click(btn)).not.toThrow();
  });

  it("clicking room home-type button does not throw", () => {
    render(<FilterPanel />);
    const btn = screen.getByRole("button", { name: /^room$/i });
    expect(() => fireEvent.click(btn)).not.toThrow();
  });
});
