"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  getNewsPublishTransitionDecision,
  getNewsSubmitTransitionDecision,
  useNewsWorkspace,
  useNewsWorkspacePublish,
  useNewsWorkspaceSubmit,
} from "@/lib/hooks/useNews";
import { useAuthStore } from "@/lib/stores/authStore";

export default function DashboardNewsPage() {
  const { user } = useAuthStore();
  const role = user?.role;
  const workspaceEnabled = role === "user" || role === "admin";

  const articleQuery = useNewsWorkspace({ enabled: workspaceEnabled });
  const submitMut = useNewsWorkspaceSubmit();
  const publishMut = useNewsWorkspacePublish();

  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const article = articleQuery.data;
  const newsStatus = article?.status ?? "draft";

  const canSubmit = role === "user";
  const canPublish = role === "admin";

  const roleLabel = useMemo(() => {
    if (!role) return "Unauthenticated";
    if (role === "admin") return "Admin";
    if (role === "user") return "User";
    return role;
  }, [role]);

  const submitDecision = getNewsSubmitTransitionDecision(role, newsStatus);
  const publishDecision = getNewsPublishTransitionDecision(role, newsStatus);

  const onSubmitForReview = async () => {
    setFeedback(null);
    if (!submitDecision.allowed) {
      setFeedback({ kind: "error", message: submitDecision.message });
      return;
    }
    try {
      await submitMut.mutateAsync();
      setFeedback({ kind: "success", message: submitDecision.message });
    } catch (e) {
      setFeedback({ kind: "error", message: e instanceof Error ? e.message : "Submit failed." });
    }
  };

  const onPublishNow = async () => {
    setFeedback(null);
    if (!publishDecision.allowed) {
      setFeedback({ kind: "error", message: publishDecision.message });
      return;
    }
    try {
      await publishMut.mutateAsync();
      setFeedback({ kind: "success", message: publishDecision.message });
    } catch (e) {
      setFeedback({ kind: "error", message: e instanceof Error ? e.message : "Publish failed." });
    }
  };

  const pending = articleQuery.isLoading || submitMut.isPending || publishMut.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">News Workspace</h1>
        <p className="text-muted-foreground">Prepare articles, route them for review, and coordinate publishing decisions by role.</p>
      </div>

      {!workspaceEnabled ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-medium text-amber-800">Sign in with a user or administrator account to use the news workspace.</p>
        </div>
      ) : articleQuery.isError ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {articleQuery.error instanceof Error ? articleQuery.error.message : "Could not load workspace."}
        </div>
      ) : null}

      {workspaceEnabled && article ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Active role: <span className="font-semibold text-foreground">{roleLabel}</span> • Article:{" "}
            <span className="font-semibold text-foreground">{article.title}</span> • State:{" "}
            <span className="font-semibold text-foreground capitalize">{newsStatus.replace("_", " ")}</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Slug: {article.slug}</p>
        </div>
      ) : null}

      {feedback ? (
        <div
          role="status"
          className={`rounded-md px-3 py-2 text-sm ${
            feedback.kind === "error"
              ? "border border-rose-200 bg-rose-50 text-rose-700"
              : "border border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold">Your draft</h2>
          <p className="mt-2 text-sm text-muted-foreground">Signed-in users can draft and submit stories for moderation.</p>
          <button
            type="button"
            onClick={() => void onSubmitForReview()}
            disabled={!canSubmit || pending || !article}
            className="mt-4 rounded-md border border-border px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
          >
            Submit For Review
          </button>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold">Administrator publish</h2>
          <p className="mt-2 text-sm text-muted-foreground">Administrators can publish items that are in pending review.</p>
          <button
            type="button"
            onClick={() => void onPublishNow()}
            disabled={!canPublish || pending || !article}
            className="mt-4 rounded-md border border-border px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
          >
            Publish Now
          </button>
        </section>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold">Moderation Guidance</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Mutations go through the API layer (MSW in development). Final rules are enforced server-side when the backend ships.
        </p>
        <Link href="/admin/news" className="mt-3 inline-flex text-sm font-medium text-accent hover:underline">
          Open admin moderation queue
        </Link>
      </div>
    </div>
  );
}
