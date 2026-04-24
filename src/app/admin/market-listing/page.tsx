"use client";

import { useMemo, useState } from "react";
import {
  canModerateMarketListingTransition,
  type MarketListingModerationStatus,
} from "@/lib/contracts/marketListing";
import { useMarketListings } from "@/lib/hooks/useMarketListings";
import { useAuthStore } from "@/lib/stores/authStore";

const moderationActions = [
  { label: "Approve", intent: "success", description: "Move reviewed listings into published status.", nextStatus: "published" },
  { label: "Unpublish", intent: "warning", description: "Remove a published listing from public surfaces pending review.", nextStatus: "unpublished" },
  { label: "Request Changes", intent: "warning", description: "Return listings with editorial or compliance feedback.", nextStatus: "changes_requested" },
  { label: "Reject", intent: "danger", description: "Decline listing updates that fail quality or policy checks.", nextStatus: "rejected" },
] as const;

function getIntentClasses(intent: (typeof moderationActions)[number]["intent"]) {
  switch (intent) {
    case "success":
      return "bg-emerald-100 text-emerald-700";
    case "warning":
      return "bg-amber-100 text-amber-700";
    case "danger":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-muted text-foreground";
  }
}

export default function AdminMarketListingPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const [queueStatus, setQueueStatus] = useState<MarketListingModerationStatus>("pending_review");
  const [rejectionReason, setRejectionReason] = useState("");
  const [latestRejectionReason, setLatestRejectionReason] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const pendingQueue = useMarketListings({ page: 1, limit: 10, status: "pending_review" });

  const pendingCountText = useMemo(() => {
    if (pendingQueue.isLoading) return "Loading moderation queue...";
    if (pendingQueue.isError) return "Queue unavailable";
    return `${pendingQueue.data?.items.length ?? 0} listing(s) pending review`;
  }, [pendingQueue.data, pendingQueue.isError, pendingQueue.isLoading]);

  const applyAction = (status: MarketListingModerationStatus) => {
    if (!isAdmin) {
      setFeedback({ kind: "error", message: "Admin access required for moderation actions." });
      return;
    }

    if (!canModerateMarketListingTransition(queueStatus, status)) {
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
      setFeedback({ kind: "success", message: `Rejected listing with reason: ${trimmedReason}` });
      return;
    }

    if (status === "unpublished") {
      setQueueStatus("unpublished");
      setFeedback({ kind: "success", message: "Unpublished listing from public market pages pending re-review." });
      return;
    }

    if (status === "published") {
      setQueueStatus("published");
      setFeedback({ kind: "success", message: "Approved listing for publication." });
      return;
    }

    setQueueStatus("changes_requested");
    setFeedback({ kind: "success", message: "Returned listing to contributor with requested changes." });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-bold">Market Listing Moderation Queue</h1>
        <p className="text-muted-foreground">Review pending updates, enforce quality standards, and decide publication outcomes.</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          Queue status: <span className="font-semibold capitalize text-foreground">{queueStatus.replace("_", " ")}</span>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Pending snapshot: <span className="font-semibold text-foreground">{pendingCountText}</span>
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
            <label htmlFor="market-listing-rejection-reason" className="text-sm font-medium">
              Rejection reason
            </label>
            <textarea
              id="market-listing-rejection-reason"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              className="mt-2 min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="Explain why this listing update is rejected."
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
        <p className="mt-2 text-sm text-muted-foreground">Admin moderation actions are recorded for compliance visibility.</p>
        {latestRejectionReason ? <p className="mt-3 text-sm text-muted-foreground">Latest rejection reason: {latestRejectionReason}</p> : null}
      </section>
    </div>
  );
}
