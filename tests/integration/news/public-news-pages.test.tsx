import { renderToStaticMarkup } from "react-dom/server";
import PublicNewsPage from "@/app/(public)/news/page";
import PublicNewsDetailPage from "@/app/(public)/news/[slug]/page";
import ManageNewsPage from "@/app/manage/news/page";
import AdminNewsPage from "@/app/admin/news/page";
import { getNews, getNewsDetail } from "@/lib/api/client";

jest.mock("@/lib/api/client", () => ({
  getNews: jest.fn(),
  getNewsDetail: jest.fn(),
}));

describe("news public and moderation pages", () => {
  beforeEach(() => {
    (getNews as jest.Mock).mockReset();
    (getNewsDetail as jest.Mock).mockReset();
  });

  it("public news index renders only published-news content", async () => {
    (getNews as jest.Mock).mockResolvedValue({
      data: {
        items: [
          {
            id: "news-1",
            slug: "rent-market-update",
            title: "Rent market update",
            summary: "Kathmandu rental demand is rising this quarter.",
            is_published: true,
            published_at: "2026-04-24T12:00:00.000Z",
            cover_image_url: null,
          },
        ],
      },
      error: null,
    });

    const html = renderToStaticMarkup(await PublicNewsPage());

    expect(getNews).toHaveBeenCalledWith({ page: 1, limit: 12 });
    expect(html).toContain(">Latest News<");
    expect(html).toContain(">Rent market update<");
    expect(html).toContain(">Kathmandu rental demand is rising this quarter.<");
    expect(html).toContain('href="/news/rent-market-update"');
  });

  it("public news detail renders published article body", async () => {
    (getNewsDetail as jest.Mock).mockResolvedValue({
      data: {
        id: "news-1",
        slug: "rent-market-update",
        title: "Rent market update",
        summary: "Kathmandu rental demand is rising this quarter.",
        content: "Detailed market narrative for renters and owners.",
        is_published: true,
        published_at: "2026-04-24T12:00:00.000Z",
        cover_image_url: null,
      },
      error: null,
    });

    const html = renderToStaticMarkup(
      await PublicNewsDetailPage({ params: Promise.resolve({ slug: "rent-market-update" }) }),
    );

    expect(getNewsDetail).toHaveBeenCalledWith("rent-market-update");
    expect(html).toContain(">Rent market update<");
    expect(html).toContain(">Detailed market narrative for renters and owners.<");
    expect(html).toContain('href="/news"');
  });

  it("manage news page communicates owner and agent moderation actions", () => {
    const html = renderToStaticMarkup(<ManageNewsPage />);

    expect(html).toContain(">News Workspace<");
    expect(html).toContain(">Submit For Review<");
    expect(html).toContain(">Publish Now<");
    expect(html).toContain(">Owners can draft and submit stories for moderation.<");
    expect(html).toContain(">Agents can publish approved posts and schedule releases.<");
  });

  it("admin news page communicates moderation controls", () => {
    const html = renderToStaticMarkup(<AdminNewsPage />);

    expect(html).toContain(">News Moderation Queue<");
    expect(html).toContain(">Approve<");
    expect(html).toContain(">Request Changes<");
    expect(html).toContain(">Reject<");
    expect(html).toContain(">Admin moderation actions are logged for compliance.<");
  });
});
