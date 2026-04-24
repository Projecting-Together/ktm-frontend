"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/authStore";

export default function ManageNewsPage() {
  const { user } = useAuthStore();
  const role = user?.role ?? "owner";
  const [newsStatus, setNewsStatus] = useState<"draft" | "pending" | "published">("draft");
  const [feedback, setFeedback] = useState("");

  const canSubmit = role === "owner" || role === "agent";
  const canPublish = role === "agent" || role === "admin";

  const roleLabel = useMemo(() => {
    if (role === "agent") return "Agent";
    if (role === "admin") return "Admin";
    return "Owner";
  }, [role]);

  const onSubmitForReview = () => {
    setNewsStatus("pending");
    setFeedback("Owner draft submitted to moderation queue as pending review.");
  };

  const onPublishNow = () => {
    setNewsStatus("published");
    setFeedback("Agent published the approved article to the public news feed.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">News Workspace</h1>
        <p className="text-muted-foreground">Prepare articles, route them for review, and coordinate publishing decisions by role.</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          Active role: <span className="font-semibold text-foreground">{roleLabel}</span> • Current article state:{" "}
          <span className="font-semibold text-foreground capitalize">{newsStatus}</span>
        </p>
      </div>

      {feedback ? (
        <div role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {feedback}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold">Owner Draft</h2>
          <p className="mt-2 text-sm text-muted-foreground">Owners can draft and submit stories for moderation.</p>
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
          <h2 className="font-semibold">Agent Review</h2>
          <p className="mt-2 text-sm text-muted-foreground">Agents can publish approved posts and schedule releases.</p>
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
        <h2 className="font-semibold">Moderation Guidance</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This scaffold aligns owner submission, agent publishing, and admin moderation workflows while API mutations are finalized.
        </p>
        <Link href="/admin/news" className="mt-3 inline-flex text-sm font-medium text-accent hover:underline">
          Open admin moderation queue
        </Link>
      </div>
    </div>
  );
}
