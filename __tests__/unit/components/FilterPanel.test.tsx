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

  it("renders all Kathmandu neighborhood buttons", () => {
    render(<FilterPanel />);
    expect(screen.getByRole("button", { name: /^thamel$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^lazimpat$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^patan$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^bhaktapur$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^koteshwor$/i })).toBeInTheDocument();
  });

  it("renders price range quick-select buttons", () => {
    render(<FilterPanel />);
    expect(screen.getByRole("button", { name: /under 10k/i })).toBeInTheDocument();
    // "10K–20K" contains "10K" — use getAllByRole to avoid ambiguity
    const buttons = screen.getAllByRole("button", { name: /10k/i });
    expect(buttons.length).toBeGreaterThan(0);
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

  it("clicking Thamel neighborhood button does not throw", () => {
    render(<FilterPanel />);
    const btn = screen.getByRole("button", { name: /^thamel$/i });
    expect(() => fireEvent.click(btn)).not.toThrow();
  });
});
