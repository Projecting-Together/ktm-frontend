import React from "react";
import { render, screen, fireEvent } from "@/test-utils/renderWithProviders";
import { act } from "@testing-library/react";
import SearchPageClient from "@/components/search/SearchPageClient";
import { useFilterStore } from "@/lib/stores/filterStore";

const mockReplace = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/apartments",
  useSearchParams: () => mockSearchParams,
}));

jest.mock("next/dynamic", () => () => {
  const DynamicStub = () => null;
  return DynamicStub;
});

const mockUseListings = jest.fn(() => ({
  data: { items: [], total: 0, total_pages: 1 },
  isPending: false,
  isError: false,
  error: null,
  refetch: jest.fn(),
  isFetching: false,
}));

jest.mock("@/lib/hooks/useListings", () => ({
  useListings: (...args: unknown[]) => mockUseListings(...args),
}));

jest.mock("@/lib/contracts/adapters", () => ({
  adaptListingsForSearch: () => [],
}));

const resetStoreData = () => {
  mockUseListings.mockClear();
  mockUseListings.mockImplementation(() => ({
    data: { items: [], total: 0, total_pages: 1 },
    isPending: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
    isFetching: false,
  }));
  useFilterStore.setState({
    page: 1,
    limit: 20,
    sort_by: "created_at",
    sort_order: "desc",
    isFilterPanelOpen: false,
    view: "grid",
    listing_type: undefined,
    purpose: undefined,
    min_price: undefined,
    max_price: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
    furnishing: undefined,
    parking: undefined,
    pets_allowed: undefined,
    verified: undefined,
    available_from: undefined,
    amenities: undefined,
    keyword: undefined,
    search: undefined,
    min_lat: undefined,
    max_lat: undefined,
    min_lng: undefined,
    max_lng: undefined,
    lat: undefined,
    lng: undefined,
    radius_km: undefined,
    neighborhood_slug: undefined,
    min_area_sqft: undefined,
    max_area_sqft: undefined,
  });
};

describe("SearchPageClient", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockSearchParams.forEach((_, key) => mockSearchParams.delete(key));
    resetStoreData();
  });

  it("renders Rent and Buy segmented controls", () => {
    render(<SearchPageClient />);
    expect(screen.getByRole("button", { name: /^rent$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^buy$/i })).toBeInTheDocument();
  });

  it("switching to Buy sets purpose=sale in URL sync", () => {
    render(<SearchPageClient />);
    mockReplace.mockClear();

    fireEvent.click(screen.getByRole("button", { name: /^buy$/i }));

    expect(useFilterStore.getState().purpose).toBe("sale");
    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringMatching(/purpose=sale/),
      expect.objectContaining({ scroll: false }),
    );
  });

  it("requests rent listings by default when purpose is absent", () => {
    render(<SearchPageClient />);

    expect(mockUseListings).toHaveBeenCalled();
    const [firstCallFilters] = mockUseListings.mock.calls[0] as [Record<string, unknown>];
    expect(firstCallFilters.purpose).toBe("rent");
  });

  it("hydrates neighborhood and area filters from URL params", () => {
    mockSearchParams.set("neighborhood_slug", "baneshwor");
    mockSearchParams.set("min_area_sqft", "450");
    mockSearchParams.set("max_area_sqft", "1100");

    render(<SearchPageClient />);

    expect(useFilterStore.getState().neighborhood_slug).toBe("baneshwor");
    expect(useFilterStore.getState().min_area_sqft).toBe(450);
    expect(useFilterStore.getState().max_area_sqft).toBe(1100);
  });

  it("ignores invalid area params during URL hydration", () => {
    mockSearchParams.set("min_area_sqft", "not-a-number");
    mockSearchParams.set("max_area_sqft", "NaN");

    render(<SearchPageClient />);

    expect(useFilterStore.getState().min_area_sqft).toBeUndefined();
    expect(useFilterStore.getState().max_area_sqft).toBeUndefined();
  });

  it("syncs neighborhood and area filters into URL params", () => {
    render(<SearchPageClient />);
    mockReplace.mockClear();

    act(() => {
      useFilterStore.getState().setFilters({
        neighborhood_slug: "baneshwor",
        min_area_sqft: 500,
        max_area_sqft: 1200,
      });
    });

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringMatching(/neighborhood_slug=baneshwor/),
      expect.objectContaining({ scroll: false }),
    );
    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringMatching(/min_area_sqft=500/),
      expect.objectContaining({ scroll: false }),
    );
    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringMatching(/max_area_sqft=1200/),
      expect.objectContaining({ scroll: false }),
    );
  });

  it("reset clears neighborhood and area filters", () => {
    act(() => {
      useFilterStore.getState().setFilters({
        neighborhood_slug: "baneshwor",
        min_area_sqft: 450,
        max_area_sqft: 1000,
      });
      useFilterStore.getState().resetFilters();
    });

    expect(useFilterStore.getState().neighborhood_slug).toBeUndefined();
    expect(useFilterStore.getState().min_area_sqft).toBeUndefined();
    expect(useFilterStore.getState().max_area_sqft).toBeUndefined();
  });

  it("normalizes area range ordering via setAreaRange", () => {
    act(() => {
      useFilterStore.getState().setAreaRange(1200, 500);
    });

    expect(useFilterStore.getState().min_area_sqft).toBe(500);
    expect(useFilterStore.getState().max_area_sqft).toBe(1200);
  });
});
