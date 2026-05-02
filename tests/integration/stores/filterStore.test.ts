import { useFilterStore, selectApiFilters } from "@/lib/stores/filterStore";

// Helper: reset only the data fields — do NOT pass true (replace) as that wipes actions
const resetStoreData = () => {
  useFilterStore.setState({
    page: 1,
    limit: 20,
    sort_by: "created_at",
    sort_order: "desc",
    isFilterPanelOpen: false,
    view: "grid",
    listing_type: undefined,
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
    purpose: undefined,
  });
};

describe("filterStore", () => {
  beforeEach(() => {
    resetStoreData();
  });

  it("starts with default page=1 and limit=20", () => {
    const state = useFilterStore.getState();
    expect(state.page).toBe(1);
    expect(state.limit).toBe(20);
  });

  it("starts with no listing_type filter", () => {
    expect(useFilterStore.getState().listing_type).toBeUndefined();
  });

  it("starts with purpose unset by default", () => {
    expect(useFilterStore.getState().purpose).toBeUndefined();
  });

  it("setFilter sets listing_type", () => {
    useFilterStore.getState().setFilter("listing_type", "apartment");
    expect(useFilterStore.getState().listing_type).toBe("apartment");
  });

  it("setFilter sets min_price and max_price", () => {
    useFilterStore.getState().setFilter("min_price", 10000);
    useFilterStore.getState().setFilter("max_price", 30000);
    expect(useFilterStore.getState().min_price).toBe(10000);
    expect(useFilterStore.getState().max_price).toBe(30000);
  });

  it("setBedroomRange sets min_bedrooms", () => {
    useFilterStore.getState().setBedroomRange(2, 4);
    expect(useFilterStore.getState().min_bedrooms).toBe(2);
    expect(useFilterStore.getState().max_bedrooms).toBe(4);
  });

  it("setFilter resets page to 1 when a filter changes", () => {
    useFilterStore.getState().setFilter("page", 3);
    useFilterStore.getState().setFilter("listing_type", "apartment");
    expect(useFilterStore.getState().page).toBe(1);
  });

  it("setFilter preserves pagination when key is page", () => {
    useFilterStore.getState().setFilter("page", 3);
    expect(useFilterStore.getState().page).toBe(3);
  });

  it("setFilters preserves explicit page value", () => {
    useFilterStore.getState().setFilters({ page: 4, search: "thamel" });
    const state = useFilterStore.getState();
    expect(state.page).toBe(4);
    expect(state.search).toBe("thamel");
  });

  it("setFilters resets page when no explicit page is provided", () => {
    useFilterStore.getState().setFilter("page", 5);
    useFilterStore.getState().setFilters({ search: "baluwatar" });
    const state = useFilterStore.getState();
    expect(state.page).toBe(1);
    expect(state.search).toBe("baluwatar");
  });

  it("resetFilters clears all custom filters", () => {
    useFilterStore.getState().setFilter("listing_type", "apartment");
    useFilterStore.getState().setFilter("max_price", 30000);
    useFilterStore.getState().setFilter("parking", true);
    useFilterStore.getState().setFilter("pets_allowed", true);
    useFilterStore.getState().setFilter("available_from", "2026-05-01");
    useFilterStore.getState().setFilter("furnishing", "semi");
    useFilterStore.getState().resetFilters();
    const state = useFilterStore.getState();
    expect(state.listing_type).toBeUndefined();
    expect(state.max_price).toBeUndefined();
    expect(state.parking).toBeUndefined();
    expect(state.pets_allowed).toBeUndefined();
    expect(state.available_from).toBeUndefined();
    expect(state.furnishing).toBeUndefined();
  });

  it("resetFilters keeps purpose unset by default", () => {
    useFilterStore.getState().setFilter("purpose", "sale");
    useFilterStore.getState().resetFilters();
    expect(useFilterStore.getState().purpose).toBeUndefined();
  });

  it("toggleListingType adds a listing type", () => {
    useFilterStore.getState().toggleListingType("apartment");
    expect(useFilterStore.getState().listing_type).toContain("apartment");
  });

  it("toggleListingType removes a type when toggled again", () => {
    useFilterStore.getState().toggleListingType("apartment");
    useFilterStore.getState().toggleListingType("apartment");
    const lt = useFilterStore.getState().listing_type;
    expect(!lt || !lt.includes("apartment")).toBe(true);
  });

  it("selectApiFilters strips UI-only state (isFilterPanelOpen, view)", () => {
    useFilterStore.getState().setFilter("listing_type", "apartment");
    const apiFilters = selectApiFilters(useFilterStore.getState());
    expect(apiFilters).not.toHaveProperty("isFilterPanelOpen");
    expect(apiFilters).not.toHaveProperty("view");
    expect(apiFilters).not.toHaveProperty("locality");
    expect(apiFilters.listing_type).toBe("apartment");
  });

  it("selectApiFilters does not include store action functions", () => {
    const apiFilters = selectApiFilters(useFilterStore.getState());
    expect(apiFilters).not.toHaveProperty("setFilter");
    expect(apiFilters).not.toHaveProperty("setPriceRange");
    expect(apiFilters).not.toHaveProperty("resetFilters");
    expect(apiFilters).not.toHaveProperty("toggleLocality");
  });

  it("store API does not expose locality helper actions", () => {
    const state = useFilterStore.getState() as unknown as Record<string, unknown>;
    expect(state).not.toHaveProperty("toggleLocality");
    expect(state).not.toHaveProperty("locality");
  });
});
