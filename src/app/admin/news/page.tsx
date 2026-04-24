"use client";

import { useState } from "react";
import { canModerateNewsTransition, type ContentStatus } from "@/lib/contracts/news";
import { useAuthStore } from "@/lib/stores/authStore";

const moderationActions = [
  { label: "Approve", intent: "success", description: "Move reviewed stories into published state.", nextStatus: "published" },
  { label: "Reject", intent: "danger", description: "Decline content that fails quality or policy checks.", nextStatus: "rejected" },
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
  const [queueStatus, setQueueStatus] = useState<ContentStatus>("pending_review");
  const [rejectionReason, setRejectionReason] = useState("");
  const [latestRejectionReason, setLatestRejectionReason] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const applyAction = (status: ContentStatus) => {
    if (!isAdmin) {
      setFeedback({ kind: "error", message: "Admin access required for moderation actions." });
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
      setQueueStatus("rejected");
      setLatestRejectionReason(trimmedReason);
      setFeedback({ kind: "success", message: `Rejected article with reason: ${trimmedReason}` });
      return;
    }

    setQueueStatus(status);
    setFeedback({ kind: "success", message: "Approved article for publication." });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">News Moderation Queue</h1>
        <p className="text-muted-foreground">Review submissions, enforce policy, and decide final publication outcomes.</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          Queue status: <span className="font-semibold text-foreground capitalize">{queueStatus.replace("_", " ")}</span>
        </p>
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

      {isAdmin ? (
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
                    onClick={() => applyAction(action.nextStatus)}
                    className="mt-3 rounded border border-border px-2 py-1 text-xs font-medium"
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
      ) : (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-medium text-amber-800">Admin access required for moderation actions.</p>
        </section>
      )}

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold">Auditability</h2>
        <p className="mt-2 text-sm text-muted-foreground">Admin moderation actions are logged for compliance.</p>
        {latestRejectionReason ? (
          <p className="mt-3 text-sm text-muted-foreground">Latest rejection reason: {latestRejectionReason}</p>
        ) : null}
      </section>
    </div>
  );
}
