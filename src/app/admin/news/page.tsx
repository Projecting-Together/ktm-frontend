"use client";

import { useEffect, useState } from "react";
import type { NewsModerationQueueItem } from "@/lib/api/types";
import { canModerateNewsTransition, type ContentStatus } from "@/lib/contracts/news";
import { useNewsModerationPatch, useNewsModerationQueue } from "@/lib/hooks/useNews";
import { useAuthStore } from "@/lib/stores/authStore";

const moderationActions = [
  { label: "Approve", intent: "success", description: "Move reviewed stories into published state.", nextStatus: "published" as const },
  { label: "Reject", intent: "danger", description: "Decline content that fails quality or policy checks.", nextStatus: "rejected" as const },
] as const;

function getIntentClasses(intent: (typeof moderationActions)[number]["intent"]) {
  switch (intent) {
    case "success":
      return "bg-emerald-100 text-emerald-700";
    case "danger":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-muted text-foreground";
  }
}

export default function AdminNewsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const queueQuery = useNewsModerationQueue({ enabled: isAdmin });
  const moderateMut = useNewsModerationPatch();

  const [pinned, setPinned] = useState<NewsModerationQueueItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const queueHead = queueQuery.data?.items[0] ?? null;

  useEffect(() => {
    if (pinned) return;
    if (queueHead) setPinned(queueHead);
  }, [queueHead, pinned]);

  const activeArticle = pinned ?? queueHead;
  const queueStatus = (activeArticle?.status ?? "pending_review") as ContentStatus;

  const applyAction = async (status: ContentStatus) => {
    setFeedback(null);

    if (!isAdmin) {
      setFeedback({ kind: "error", message: "Admin access required for moderation actions." });
      return;
    }

    if (!activeArticle) {
      setFeedback({ kind: "error", message: "No article loaded for moderation." });
      return;
    }

    if (!canModerateNewsTransition(queueStatus, status)) {
      setFeedback({
        kind: "error",
        message: `Transition blocked: cannot move from ${queueStatus.replace("_", " ")} to ${status.replace("_", " ")}.`,
      });
      return;
    }

    if (status === "rejected") {
      const trimmedReason = rejectionReason.trim();
      if (!trimmedReason) {
        setFeedback({ kind: "error", message: "Provide a rejection reason before rejecting." });
        return;
      }
    }

    try {
      const updated = await moderateMut.mutateAsync({
        articleId: activeArticle.id,
        status,
        rejection_reason: status === "rejected" ? rejectionReason.trim() : null,
      });
      setPinned(updated);
      if (status === "rejected") {
        setFeedback({ kind: "success", message: `Rejected article with reason: ${rejectionReason.trim()}` });
      } else {
        setFeedback({ kind: "success", message: "Approved article for publication." });
      }
    } catch (e) {
      setFeedback({ kind: "error", message: e instanceof Error ? e.message : "Moderation request failed." });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">News Moderation Queue</h1>
        <p className="text-muted-foreground">Review submissions, enforce policy, and decide publication outcomes.</p>
      </div>

      {isAdmin && queueQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading moderation queue…</p>
      ) : null}

      {isAdmin && queueQuery.isError ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {queueQuery.error instanceof Error ? queueQuery.error.message : "Could not load queue."}
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          Article state:{" "}
          <span className="font-semibold text-foreground capitalize">{queueStatus.replace("_", " ")}</span>
          {activeArticle ? (
            <>
              {" "}
              • <span className="font-medium text-foreground">{activeArticle.title}</span>
            </>
          ) : null}
        </p>
        {!isAdmin ? (
          <p className="mt-2 text-xs text-muted-foreground">Sign in as admin to load the queue.</p>
        ) : null}
        {isAdmin && !queueQuery.isLoading && !activeArticle ? (
          <p className="mt-2 text-sm text-muted-foreground">No articles are waiting for review.</p>
        ) : null}
      </div>

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

      {isAdmin && activeArticle ? (
        <>
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold">Available Actions</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              {moderationActions.map((action) => (
                <article key={action.label} className="rounded-lg border border-border p-4">
                  <p className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getIntentClasses(action.intent)}`}>
                    {action.label}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">{action.description}</p>
                  <button
                    type="button"
                    onClick={() => void applyAction(action.nextStatus)}
                    disabled={moderateMut.isPending}
                    className="mt-3 rounded border border-border px-2 py-1 text-xs font-medium disabled:opacity-60"
                  >
                    {action.label}
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <label htmlFor="news-rejection-reason" className="text-sm font-medium">
              Rejection reason
            </label>
            <textarea
              id="news-rejection-reason"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              className="mt-2 min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="Explain why this article is rejected."
            />
          </section>
        </>
      ) : null}

      {!isAdmin ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-medium text-amber-800">Admin access required for moderation actions.</p>
        </section>
      ) : null}

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold">Auditability</h2>
        <p className="mt-2 text-sm text-muted-foreground">Production moderation should persist audit logs on the server.</p>
        {activeArticle?.rejection_reason ? (
          <p className="mt-3 text-sm text-muted-foreground">Latest rejection reason: {activeArticle.rejection_reason}</p>
        ) : null}
      </section>
    </div>
  );
}
