const moderationActions = [
  { label: "Approve", intent: "success", description: "Move reviewed stories into published state." },
  { label: "Request Changes", intent: "warning", description: "Return stories to author with editorial feedback." },
  { label: "Reject", intent: "danger", description: "Decline content that fails quality or policy checks." },
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

export default function AdminNewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">News Moderation Queue</h1>
        <p className="text-muted-foreground">Review submissions, enforce policy, and decide final publication outcomes.</p>
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold">Available Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {moderationActions.map((action) => (
            <article key={action.label} className="rounded-lg border border-border p-4">
              <p className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getIntentClasses(action.intent)}`}>
                {action.label}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{action.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold">Auditability</h2>
        <p className="mt-2 text-sm text-muted-foreground">Admin moderation actions are logged for compliance.</p>
      </section>
    </div>
  );
}
