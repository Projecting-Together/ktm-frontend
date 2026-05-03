import React from "react";
import { render, screen, fireEvent } from "@/test-utils/renderWithProviders";
import { FilterPanel } from "@/components/search/FilterPanel";
import { useFilterStore } from "@/lib/stores/filterStore";

describe("FilterPanel", () => {
  beforeEach(() => {
    useFilterStore.getState().resetFilters();
  });

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

  it("renders a city filter section (stores city_slug)", () => {
    render(<FilterPanel />);
    expect(screen.getByText(/^city$/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /city filter/i })).toBeInTheDocument();
  });

  it("renders price range slider and min/max inputs", () => {
    render(<FilterPanel />);
    expect(screen.getByRole("slider", { name: /minimum price slider/i })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: /maximum price slider/i })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: /minimum price/i })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: /maximum price/i })).toBeInTheDocument();
  });

  it("renders bedroom range sliders and inputs", () => {
    render(<FilterPanel />);
    expect(screen.getByRole("slider", { name: /minimum bedrooms slider/i })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: /maximum bedrooms slider/i })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: /minimum bedrooms/i })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: /maximum bedrooms/i })).toBeInTheDocument();
  });

  it("renders bathroom range sliders and inputs", () => {
    render(<FilterPanel />);
    expect(screen.getByRole("slider", { name: /minimum bathrooms slider/i })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: /maximum bathrooms slider/i })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: /minimum bathrooms/i })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: /maximum bathrooms/i })).toBeInTheDocument();
  });

  it("shows area range summary with m² when area filters are set", () => {
    useFilterStore.getState().setFilters({ min_area_m2: 50, max_area_m2: 150 });
    render(<FilterPanel />);
    expect(screen.getByTestId("area-range-summary")).toHaveTextContent("50 m²");
    expect(screen.getByTestId("area-range-summary")).toHaveTextContent("150 m²");
  });

  it("renders furnishing checkboxes", () => {
    render(<FilterPanel />);
    expect(screen.getByRole("checkbox", { name: /fully furnished/i })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /semi furnished/i })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /unfurnished/i })).toBeInTheDocument();
  });

  it("shows verified switch by default and hides parking/pets until More filters", () => {
    render(<FilterPanel />);
    expect(screen.getByRole("switch", { name: /verified listings only/i })).toBeInTheDocument();
    expect(screen.queryByRole("switch", { name: /parking available/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("switch", { name: /pet-friendly/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /more filters/i }));
    expect(screen.getByRole("switch", { name: /parking available/i })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: /pet-friendly/i })).toBeInTheDocument();
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

  it("adjusting bathroom range shows reset affordance", () => {
    render(<FilterPanel />);
    const minBath = screen.getByRole("spinbutton", { name: /minimum bathrooms/i });
    fireEvent.change(minBath, { target: { value: "2" } });
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
  });

  it("toggles furnishing checkboxes and clears when last option is unchecked", () => {
    render(<FilterPanel />);

    const fullyFurnished = screen.getByRole("checkbox", { name: /fully furnished/i });
    fireEvent.click(fullyFurnished);
    expect(useFilterStore.getState().furnishing).toEqual(["fully"]);

    fireEvent.click(fullyFurnished);
    expect(useFilterStore.getState().furnishing).toBeUndefined();
  });
});
