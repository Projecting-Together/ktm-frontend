"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  getMarketListingPublishTransitionDecision,
  getMarketListingSubmitTransitionDecision,
  useMarketListings,
} from "@/lib/hooks/useMarketListings";
import { useAuthStore } from "@/lib/stores/authStore";

export default function ManageMarketListingPage() {
  const { user } = useAuthStore();
  const role = user?.role;
  const [listingStatus, setListingStatus] = useState<"draft" | "pending_review" | "published" | "rejected">("draft");
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const moderationQueue = useMarketListings({ page: 1, limit: 5, status: "pending_review" });

  const canSubmit = role === "owner" || role === "agent" || role === "admin";
  const canPublish = role === "agent" || role === "admin";

  const roleLabel = useMemo(() => {
    if (!role) return "Unauthenticated";
    if (role === "agent") return "Agent";
    if (role === "admin") return "Admin";
    return "Owner";
  }, [role]);

  const pendingCount = moderationQueue.data?.items.length ?? 0;

  const onSubmitForReview = () => {
    const decision = getMarketListingSubmitTransitionDecision(role, listingStatus);
    setFeedback({ kind: decision.allowed ? "success" : "error", message: decision.message });
    if (!decision.allowed) return;
    setListingStatus(decision.nextStatus);
  };

  const onPublishNow = () => {
    const decision = getMarketListingPublishTransitionDecision(role, listingStatus);
    setFeedback({ kind: decision.allowed ? "success" : "error", message: decision.message });
    if (!decision.allowed) return;
    setListingStatus(decision.nextStatus);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-bold">Market Listing Workspace</h1>
        <p className="text-muted-foreground">Prepare listing updates, route submissions for review, and coordinate publishing outcomes by role.</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          Active role: <span className="font-semibold text-foreground">{roleLabel}</span> • Current listing state:{" "}
          <span className="font-semibold capitalize text-foreground">{listingStatus.replace("_", " ")}</span>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Pending moderation queue:{" "}
          <span className="font-semibold text-foreground">
            {moderationQueue.isLoading ? "Loading..." : `${pendingCount} listing(s)`}
          </span>
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold">Owner Submission</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Owners submit to moderation while trusted agents and admins can submit directly to publish.
          </p>
          <button
            type="button"
            onClick={onSubmitForReview}
            disabled={!canSubmit}
            className="mt-4 rounded-md border border-border px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
          >
            Submit For Review
          </button>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold">Agent Publish Gate</h2>
          <p className="mt-2 text-sm text-muted-foreground">Agents can publish approved market updates to public pages.</p>
          <button
            type="button"
            onClick={onPublishNow}
            disabled={!canPublish}
            className="mt-4 rounded-md border border-border px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
          >
            Publish Now
          </button>
        </section>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold">Moderation Coordination</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Use this handoff flow while mutation APIs are finalized to align owner, agent, and admin responsibilities.
        </p>
        <Link href="/admin/market-listing" className="mt-3 inline-flex text-sm font-medium text-accent hover:underline">
          Open admin moderation queue
        </Link>
      </div>
    </div>
  );
}
