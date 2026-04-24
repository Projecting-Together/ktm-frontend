import {
  buildMarketListingQueryParams,
  getMarketListingDetail,
  getMarketListings,
} from "@/lib/api/client";
import { marketListingKeys } from "@/lib/hooks/useMarketListings";

describe("Market listings API query behavior", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("buildMarketListingQueryParams serializes only defined filters", () => {
    const params = buildMarketListingQueryParams({
      page: 2,
      limit: 12,
      status: "published",
      property_type: "apartment",
      search: "",
    });

    expect(params.get("page")).toBe("2");
    expect(params.get("limit")).toBe("12");
    expect(params.get("status")).toBe("published");
    expect(params.get("property_type")).toBe("apartment");
    expect(params.has("search")).toBe(false);
  });

  it("getMarketListings requests list route with encoded filters", async () => {
    const fetchMock = global.fetch as jest.MockedFunction<typeof fetch>;
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          items: [
            {
              id: "market-1",
              title: "Baluwatar Apartment Block",
              slug: "baluwatar-apartment-block",
              description: "Prime central block for residential buyers",
              price: 45000000,
              currency: "NPR",
              location: "Baluwatar, Kathmandu",
              property_type: "apartment",
              status: "published",
              published_at: "2026-04-24T09:00:00.000Z",
              created_at: "2026-04-20T09:00:00.000Z",
              updated_at: "2026-04-24T09:00:00.000Z",
            },
          ],
          total: 1,
          page: 2,
          page_size: 12,
          total_pages: 1,
          has_next: false,
          has_prev: true,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const result = await getMarketListings({
      page: 2,
      limit: 12,
      status: "published",
      property_type: "apartment",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/market-listings");
    expect(String(url)).toContain("page=2");
    expect(String(url)).toContain("limit=12");
    expect(String(url)).toContain("status=published");
    expect(String(url)).toContain("property_type=apartment");
    expect(result.error).toBeNull();
    expect(result.data?.items).toHaveLength(1);
  });

  it("getMarketListings returns non-OK response error", async () => {
    const fetchMock = global.fetch as jest.MockedFunction<typeof fetch>;
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: "Service unavailable" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      })
    );

    const result = await getMarketListings({ status: "published" });

    expect(result.data).toBeNull();
    expect(result.error?.status).toBe(503);
    expect(result.error?.message).toBe("Service unavailable");
  });

  it("getMarketListingDetail requests detail route by slug", async () => {
    const fetchMock = global.fetch as jest.MockedFunction<typeof fetch>;
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: "market-1",
          title: "Baluwatar Apartment Block",
          slug: "baluwatar-apartment-block",
          description: "Prime central block for residential buyers",
          price: 45000000,
          currency: "NPR",
          location: "Baluwatar, Kathmandu",
          property_type: "apartment",
          status: "published",
          published_at: "2026-04-24T09:00:00.000Z",
          created_at: "2026-04-20T09:00:00.000Z",
          updated_at: "2026-04-24T09:00:00.000Z",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const result = await getMarketListingDetail("baluwatar-apartment-block");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/market-listings/baluwatar-apartment-block");
    expect(result.error).toBeNull();
    expect(result.data?.slug).toBe("baluwatar-apartment-block");
  });

  it("market listing query keys expose list and detail helpers", () => {
    expect(marketListingKeys.all).toEqual(["market-listings"]);
    expect(marketListingKeys.lists()).toEqual(["market-listings", "list"]);
    expect(
      marketListingKeys.list({
        page: 1,
        limit: 12,
        status: "published",
      })
    ).toEqual(["market-listings", "list", { page: 1, limit: 12, status: "published" }]);
    expect(marketListingKeys.details()).toEqual(["market-listings", "detail"]);
    expect(marketListingKeys.detail("baluwatar-apartment-block")).toEqual([
      "market-listings",
      "detail",
      "baluwatar-apartment-block",
    ]);
  });
});
