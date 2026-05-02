import { renderToStaticMarkup } from "react-dom/server";
import { fireEvent, render, screen, waitFor } from "@/test-utils/renderWithProviders";
import PublicNewsPage from "@/app/(public)/news/page";
import PublicNewsDetailPage from "@/app/(public)/news/[slug]/page";
import ManageNewsPage from "@/app/manage/news/page";
import AdminNewsPage from "@/app/admin/news/page";
import {
  getNews,
  getNewsDetail,
  getNewsModerationQueue,
  getNewsWorkspaceArticle,
  patchNewsModeration,
  postNewsWorkspaceSubmit,
} from "@/lib/api/client";
import { canModerateNewsTransition } from "@/lib/contracts/news";
import { useAuthStore } from "@/lib/stores/authStore";
import { notFound } from "next/navigation";

jest.mock("@/lib/api/client", () => ({
  getNews: jest.fn(),
  getNewsDetail: jest.fn(),
  getNewsWorkspaceArticle: jest.fn(),
  postNewsWorkspaceSubmit: jest.fn(),
  postNewsWorkspacePublish: jest.fn(),
  getNewsModerationQueue: jest.fn(),
  patchNewsModeration: jest.fn(),
}));

jest.mock("@/lib/stores/authStore", () => ({
  useAuthStore: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

const workspaceDraft = {
  id: "news-workspace-001",
  slug: "owner-news-draft",
  title: "Owner column draft",
  status: "draft" as const,
  author_user_id: "usr-owner-001",
  rejection_reason: null,
  published_at: null,
};

describe("news public and moderation pages", () => {
  beforeEach(() => {
    (getNews as jest.Mock).mockReset();
    (getNewsDetail as jest.Mock).mockReset();
    (getNewsWorkspaceArticle as jest.Mock).mockReset();
    (postNewsWorkspaceSubmit as jest.Mock).mockReset();
    (getNewsModerationQueue as jest.Mock).mockReset();
    (patchNewsModeration as jest.Mock).mockReset();
    (useAuthStore as jest.Mock).mockReset();
    (notFound as jest.Mock).mockClear();
    (useAuthStore as jest.Mock).mockReturnValue({ user: { role: "owner" } });
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

  it("manage news page allows owner submit intent with visible feedback", async () => {
    (getNewsWorkspaceArticle as jest.Mock)
      .mockResolvedValueOnce({ data: workspaceDraft, error: null })
      .mockResolvedValue({
        data: { ...workspaceDraft, status: "pending_review" as const },
        error: null,
      });
    (postNewsWorkspaceSubmit as jest.Mock).mockResolvedValue({
      data: { ...workspaceDraft, status: "pending_review" as const },
      error: null,
    });

    render(<ManageNewsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Submit For Review" })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole("button", { name: "Submit For Review" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Owner draft submitted to moderation queue as pending review.");
    });
    expect(postNewsWorkspaceSubmit).toHaveBeenCalled();
  });

  it("admin news page supports reject action with reason and feedback", async () => {
    (useAuthStore as jest.Mock).mockReturnValue({ user: { role: "admin" } });
    (getNewsModerationQueue as jest.Mock).mockResolvedValue({
      data: {
        items: [
          {
            id: "news-workspace-001",
            slug: "owner-news-draft",
            title: "Queued article",
            status: "pending_review",
            author_user_id: "usr-owner-001",
            rejection_reason: null,
            published_at: null,
          },
        ],
      },
      error: null,
    });
    (patchNewsModeration as jest.Mock).mockResolvedValue({
      data: {
        id: "news-workspace-001",
        slug: "owner-news-draft",
        title: "Queued article",
        status: "rejected",
        rejection_reason: "Needs factual sources.",
        author_user_id: "usr-owner-001",
        published_at: null,
      },
      error: null,
    });

    render(<AdminNewsPage />);

    const reasonInput = await screen.findByLabelText("Rejection reason");
    fireEvent.change(reasonInput, {
      target: { value: "Needs factual sources." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Rejected article with reason: Needs factual sources.");
    });
    expect(screen.getByText("Latest rejection reason: Needs factual sources.")).toBeInTheDocument();
  });

  it("manage news page blocks invalid publish transition with explicit feedback", async () => {
    (useAuthStore as jest.Mock).mockReturnValue({ user: { role: "agent" } });
    (getNewsWorkspaceArticle as jest.Mock).mockResolvedValue({
      data: {
        id: "news-workspace-001",
        slug: "owner-news-draft",
        title: "Article",
        status: "draft",
        author_user_id: "usr-agent-001",
        rejection_reason: null,
        published_at: null,
      },
      error: null,
    });

    render(<ManageNewsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Publish Now" })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole("button", { name: "Publish Now" }));

    expect(screen.getByRole("status")).toHaveTextContent("News can only be published after it enters pending review.");
  });

  it("admin news page blocks moderation actions for non-admin users", () => {
    (useAuthStore as jest.Mock).mockReturnValue({ user: { role: "owner" } });

    render(<AdminNewsPage />);

    expect(screen.getByText("Admin access required for moderation actions.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reject" })).not.toBeInTheDocument();
  });

  it("admin news page blocks invalid transitions using contract rules", async () => {
    (useAuthStore as jest.Mock).mockReturnValue({ user: { role: "admin" } });
    expect(canModerateNewsTransition("rejected", "published")).toBe(false);

    (getNewsModerationQueue as jest.Mock).mockResolvedValue({
      data: {
        items: [
          {
            id: "news-workspace-001",
            slug: "owner-news-draft",
            title: "Article",
            status: "pending_review",
            author_user_id: "usr-owner-001",
            rejection_reason: null,
            published_at: null,
          },
        ],
      },
      error: null,
    });
    (patchNewsModeration as jest.Mock).mockResolvedValueOnce({
      data: {
        id: "news-workspace-001",
        slug: "owner-news-draft",
        title: "Article",
        status: "rejected",
        rejection_reason: "Needs sourcing.",
        author_user_id: "usr-owner-001",
        published_at: null,
      },
      error: null,
    });

    render(<AdminNewsPage />);

    const reasonField = await screen.findByLabelText("Rejection reason");

    fireEvent.change(reasonField, {
      target: { value: "Needs sourcing." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    await waitFor(() => {
      expect(patchNewsModeration).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Transition blocked: cannot move from rejected to published.",
    );
    expect(screen.getByRole("status")).toHaveClass("bg-rose-50");
  });
});
