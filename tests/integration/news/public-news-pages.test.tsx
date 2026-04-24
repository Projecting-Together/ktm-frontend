import { renderToStaticMarkup } from "react-dom/server";
import { fireEvent, render, screen } from "@testing-library/react";
import PublicNewsPage from "@/app/(public)/news/page";
import PublicNewsDetailPage from "@/app/(public)/news/[slug]/page";
import ManageNewsPage from "@/app/manage/news/page";
import AdminNewsPage from "@/app/admin/news/page";
import { getNews, getNewsDetail } from "@/lib/api/client";
import { notFound } from "next/navigation";

jest.mock("@/lib/api/client", () => ({
  getNews: jest.fn(),
  getNewsDetail: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

describe("news public and moderation pages", () => {
  beforeEach(() => {
    (getNews as jest.Mock).mockReset();
    (getNewsDetail as jest.Mock).mockReset();
    (notFound as jest.Mock).mockClear();
  });

  it("public news index excludes draft content from render output", async () => {
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
          {
            id: "news-2",
            slug: "draft-story",
            title: "Draft story",
            summary: "This should never appear publicly.",
            is_published: false,
            published_at: null,
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
    expect(html).not.toContain(">Draft story<");
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

  it("public news index renders unavailable state on API errors", async () => {
    (getNews as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: "Cannot reach API", status: 503 },
    });

    const html = renderToStaticMarkup(await PublicNewsPage());

    expect(html).toContain(">News is temporarily unavailable<");
    expect(html).toContain(">We could not load published news right now. Please try again shortly.<");
    expect(html).not.toContain(">No published news yet<");
  });

  it("public news detail uses notFound only for true 404", async () => {
    (getNewsDetail as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: "News not found", status: 404 },
    });

    await expect(PublicNewsDetailPage({ params: Promise.resolve({ slug: "unknown-slug" }) })).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it("public news detail renders explicit error state for non-404 errors", async () => {
    (getNewsDetail as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: "Service unavailable", status: 503 },
    });

    const html = renderToStaticMarkup(
      await PublicNewsDetailPage({ params: Promise.resolve({ slug: "rent-market-update" }) }),
    );

    expect(notFound).not.toHaveBeenCalled();
    expect(html).toContain(">Article temporarily unavailable<");
    expect(html).toContain(">We could not load this news article right now. Please try again shortly.<");
  });

  it("manage news page allows owner submit intent with visible feedback", () => {
    render(<ManageNewsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Submit For Review" }));

    expect(screen.getByRole("status")).toHaveTextContent("Owner draft submitted to moderation queue as pending review.");
  });

  it("admin news page supports reject action with reason and feedback", () => {
    render(<AdminNewsPage />);

    fireEvent.change(screen.getByLabelText("Rejection reason"), {
      target: { value: "Needs factual sources." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    expect(screen.getByRole("status")).toHaveTextContent("Rejected article with reason: Needs factual sources.");
    expect(screen.getByText("Latest rejection reason: Needs factual sources.")).toBeInTheDocument();
  });
});
