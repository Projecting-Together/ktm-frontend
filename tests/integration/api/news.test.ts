import { buildNewsQueryParams, getNews, getNewsDetail } from "@/lib/api/client";
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

  it("buildNewsQueryParams omits undefined and null values", () => {
    const params = buildNewsQueryParams({
      page: 1,
      limit: undefined,
      search: null as unknown as string,
      category: undefined,
    });

    expect(params.get("page")).toBe("1");
    expect(params.has("limit")).toBe(false);
    expect(params.has("search")).toBe(false);
    expect(params.has("category")).toBe(false);
  });

  it("getNews uses published list route with encoded filters", async () => {
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

    const result = await getNews({ page: 2, limit: 6, search: "rent market" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/news/published");
    expect(String(url)).toContain("page=2");
    expect(String(url)).toContain("limit=6");
    expect(String(url)).toContain("search=rent+market");
    expect(result.error).toBeNull();
    expect(result.data?.items).toHaveLength(1);
  });

  it("getNews returns non-OK response error for list route", async () => {
    const fetchMock = global.fetch as jest.MockedFunction<typeof fetch>;
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: "Service unavailable" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      })
    );

    const result = await getNews({ page: 1, limit: 6 });

    expect(result.data).toBeNull();
    expect(result.error?.status).toBe(503);
    expect(result.error?.message).toBe("Service unavailable");
  });

  it("getNewsDetail requests published detail route", async () => {
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

    const result = await getNewsDetail("rent-market-update");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/news/published/rent-market-update");
    expect(result.error).toBeNull();
    expect(result.data?.slug).toBe("rent-market-update");
  });

  it("getNewsDetail returns error for missing slug", async () => {
    const fetchMock = global.fetch as jest.MockedFunction<typeof fetch>;
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: "News not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    );

    const result = await getNewsDetail("does-not-exist");

    expect(result.data).toBeNull();
    expect(result.error?.status).toBe(404);
    expect(result.error?.message).toBe("News not found");
  });

  it("news query keys expose list and detail helpers", () => {
    expect(newsKeys.all).toEqual(["news"]);
    expect(newsKeys.lists()).toEqual(["news", "list"]);
    expect(newsKeys.list({ page: 1, limit: 6 })).toEqual(["news", "list", { page: 1, limit: 6 }]);
    expect(newsKeys.details()).toEqual(["news", "detail"]);
    expect(newsKeys.detail("rent-market-update")).toEqual(["news", "detail", "rent-market-update"]);
  });
});
