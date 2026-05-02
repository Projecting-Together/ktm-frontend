import React from "react";
import { render, screen, fireEvent, waitFor } from "@/test-utils/renderWithProviders";
import { act } from "@testing-library/react";
import SearchPageClient from "@/components/search/SearchPageClient";
import { useFilterStore } from "@/lib/stores/filterStore";

const mockReplace = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/listings",
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
    min_bedrooms: undefined,
    max_bedrooms: undefined,
    min_bathrooms: undefined,
    max_bathrooms: undefined,
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
    city_slug: undefined,
    min_area_m2: undefined,
    max_area_m2: undefined,
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

  it("hydrates city_slug and area filters from URL params", () => {
    mockSearchParams.set("city_slug", "kathmandu");
    mockSearchParams.set("min_area_m2", "450");
    mockSearchParams.set("max_area_m2", "1100");

    render(<SearchPageClient />);

    expect(useFilterStore.getState().city_slug).toBe("kathmandu");
    expect(useFilterStore.getState().min_area_m2).toBe(450);
    expect(useFilterStore.getState().max_area_m2).toBe(1100);
  });

  it("hydrates bathrooms filter from legacy URL params", () => {
    mockSearchParams.set("bathrooms", "2");

    render(<SearchPageClient />);

    expect(useFilterStore.getState().min_bathrooms).toBe(2);
  });

  it("ignores invalid area params during URL hydration", () => {
    mockSearchParams.set("min_area_m2", "not-a-number");
    mockSearchParams.set("max_area_m2", "NaN");

    render(<SearchPageClient />);

    expect(useFilterStore.getState().min_area_m2).toBeUndefined();
    expect(useFilterStore.getState().max_area_m2).toBeUndefined();
  });

  it("syncs city_slug and area filters into URL params", () => {
    render(<SearchPageClient />);
    mockReplace.mockClear();

    act(() => {
      useFilterStore.getState().setFilters({
        city_slug: "kathmandu",
        min_area_m2: 500,
        max_area_m2: 1200,
      });
    });

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringMatching(/city_slug=kathmandu/),
      expect.objectContaining({ scroll: false }),
    );
    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringMatching(/min_area_m2=500/),
      expect.objectContaining({ scroll: false }),
    );
    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringMatching(/max_area_m2=1200/),
      expect.objectContaining({ scroll: false }),
    );
  });

  it("syncs min bathrooms filter into URL params", () => {
    render(<SearchPageClient />);
    mockReplace.mockClear();

    act(() => {
      useFilterStore.getState().setFilters({
        min_bathrooms: 3,
      });
    });

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringMatching(/min_bathrooms=3/),
      expect.objectContaining({ scroll: false }),
    );
  });

  it("syncs decimal min_area_m2 and max_area_m2 params across partial updates", async () => {
    render(<SearchPageClient />);
    mockReplace.mockClear();

    act(() => {
      useFilterStore.getState().setFilters({
        max_area_m2: 90.5,
      });
    });
    act(() => {
      useFilterStore.getState().setFilters({
        min_area_m2: 25.5,
      });
    });

    await waitFor(() => {
      const [latestUrl] = mockReplace.mock.calls.at(-1) as [string, { scroll: boolean }];
      expect(latestUrl).toContain("min_area_m2=25.5");
      expect(latestUrl).toContain("max_area_m2=90.5");
    });
  });

  it("reset clears city_slug and area filters", () => {
    act(() => {
      useFilterStore.getState().setFilters({
        city_slug: "baneshwor",
        min_area_m2: 450,
        max_area_m2: 1000,
      });
      useFilterStore.getState().resetFilters();
    });

    expect(useFilterStore.getState().city_slug).toBeUndefined();
    expect(useFilterStore.getState().min_area_m2).toBeUndefined();
    expect(useFilterStore.getState().max_area_m2).toBeUndefined();
  });

  it("normalizes area range ordering via setAreaRange", () => {
    act(() => {
      useFilterStore.getState().setAreaRange(1200, 500);
    });

    expect(useFilterStore.getState().min_area_m2).toBe(500);
    expect(useFilterStore.getState().max_area_m2).toBe(1200);
  });
});
