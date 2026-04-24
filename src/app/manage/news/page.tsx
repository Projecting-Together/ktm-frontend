import Link from "next/link";

const moderationStages = [
  {
    title: "Owner Draft",
    description: "Owners can draft and submit stories for moderation.",
    action: "Submit For Review",
  },
  {
    title: "Agent Review",
    description: "Agents can publish approved posts and schedule releases.",
    action: "Publish Now",
  },
  {
    title: "Admin Oversight",
    description: "Admins can intervene on escalated posts and policy flags.",
    action: "Escalate To Admin",
  },
];

export default function ManageNewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">News Workspace</h1>
        <p className="text-muted-foreground">Prepare articles, route them for review, and coordinate publishing decisions by role.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {moderationStages.map((stage) => (
          <section key={stage.title} className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold">{stage.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{stage.description}</p>
            <button type="button" className="mt-4 rounded-md border border-border px-3 py-1.5 text-sm font-medium">
              {stage.action}
            </button>
          </section>
        ))}
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
