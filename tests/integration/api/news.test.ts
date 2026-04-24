import { buildNewsQueryParams, getNewsBySlug, getPublishedNews } from "@/lib/api/client";
import { newsKeys } from "@/lib/hooks/useNews";

describe("News API query behavior", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("buildNewsQueryParams serializes only defined filters", () => {
    const params = buildNewsQueryParams({
      page: 2,
      limit: 6,
      search: "market",
      category: "",
    });

    expect(params.get("page")).toBe("2");
    expect(params.get("limit")).toBe("6");
    expect(params.get("search")).toBe("market");
    expect(params.has("category")).toBe(false);
  });

  it("getPublishedNews uses published list route with encoded filters", async () => {
    const fetchMock = global.fetch as jest.MockedFunction<typeof fetch>;
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          items: [
            {
              id: "news-1",
              slug: "rent-market-update",
              title: "Rent market update",
              summary: "Kathmandu rental market trend",
              cover_image_url: null,
              published_at: "2026-04-24T12:00:00.000Z",
              is_published: true,
            },
          ],
          total: 1,
          page: 2,
          page_size: 6,
          total_pages: 1,
          has_next: false,
          has_prev: true,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const result = await getPublishedNews({ page: 2, limit: 6, search: "rent market" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/news/published");
    expect(String(url)).toContain("page=2");
    expect(String(url)).toContain("limit=6");
    expect(String(url)).toContain("search=rent+market");
    expect(result.error).toBeNull();
    expect(result.data?.items).toHaveLength(1);
  });

  it("getNewsBySlug requests published detail route", async () => {
    const fetchMock = global.fetch as jest.MockedFunction<typeof fetch>;
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: "news-1",
          slug: "rent-market-update",
          title: "Rent market update",
          summary: "Kathmandu rental market trend",
          content: "Detailed article body",
          cover_image_url: null,
          published_at: "2026-04-24T12:00:00.000Z",
          is_published: true,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const result = await getNewsBySlug("rent-market-update");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/news/published/rent-market-update");
    expect(result.error).toBeNull();
    expect(result.data?.slug).toBe("rent-market-update");
  });

  it("news query keys expose list and detail helpers", () => {
    expect(newsKeys.all).toEqual(["news"]);
    expect(newsKeys.list({ page: 1, limit: 6 })).toEqual(["news", "list", { page: 1, limit: 6 }]);
    expect(newsKeys.detail("rent-market-update")).toEqual(["news", "detail", "rent-market-update"]);
  });
});
