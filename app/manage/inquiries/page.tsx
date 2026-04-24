"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReceivedInquiries, replyToInquiry } from "@/lib/api/client";
import { formatRelativeTime } from "@/lib/utils";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";

type PurposeFilter = "all" | "sale" | "rent";

export default function ManageInquiriesPage() {
  const qc = useQueryClient();
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [purposeFilter, setPurposeFilter] = useState<PurposeFilter>("all");

  const { data: inquiries, isLoading } = useQuery({
    queryKey: ["inquiries", "received"],
    queryFn: async () => {
      const res = await getReceivedInquiries();
      if (res.error) throw new Error(res.error.message);
      return res.data ?? [];
    },
  });

  const { mutate: sendReply } = useMutation({
    mutationFn: ({ id, reply }: { id: string; reply: string }) => replyToInquiry(id, reply).then(r => { if (r.error) throw new Error(r.error.message); return r.data!; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["inquiries", "received"] }); setReplyingTo(null); toast.success("Reply sent"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const filteredInquiries = (inquiries ?? []).filter((inq) => {
    if (purposeFilter === "all") return true;
    return inq.listing?.purpose === purposeFilter;
  });

  const purposeLabel = (purpose: "sale" | "rent" | undefined | null) => {
    if (purpose === "sale") return "Sale Lead";
    if (purpose === "rent") return "Rental Lead";
    return "Lead";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Inquiries</h1>
      <p className="text-muted-foreground mb-6">Messages from potential renters.</p>

      {!isLoading && inquiries?.length ? (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setPurposeFilter("all")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              purposeFilter === "all"
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All Leads
          </button>
          <button
            onClick={() => setPurposeFilter("rent")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              purposeFilter === "rent"
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Rental Leads
          </button>
          <button
            onClick={() => setPurposeFilter("sale")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              purposeFilter === "sale"
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Sale Leads
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-3">{Array.from({length:3}).map((_,i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
      ) : !inquiries?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold">No inquiries yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Inquiries from renters will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inq) => (
            <div key={inq.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold text-sm">{inq.sender?.first_name ?? "Renter"}</p>
                  <p className="text-xs text-muted-foreground">{formatRelativeTime(inq.created_at)}</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">{purposeLabel(inq.listing?.purpose)}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                  inq.status === "replied" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                }`}>{inq.status}</span>
              </div>
              <p className="text-sm text-muted-foreground">{inq.message}</p>
              {inq.owner_reply && (
                <div className="mt-3 rounded-lg bg-muted p-3 text-sm">
                  <p className="text-xs font-semibold text-accent mb-1">Your reply:</p>
                  <p>{inq.owner_reply}</p>
                </div>
              )}
              {!inq.owner_reply && (
                replyingTo === inq.id ? (
                  <div className="mt-3 space-y-2">
                    <textarea value={replyText[inq.id] ?? ""} onChange={(e) => setReplyText(p => ({...p, [inq.id]: e.target.value}))}
                      placeholder="Write your reply..." rows={3}
                      className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
                    <div className="flex gap-2">
                      <button onClick={() => sendReply({ id: inq.id, reply: replyText[inq.id] ?? "" })} className="btn-primary text-xs px-4 py-2">Send Reply</button>
                      <button onClick={() => setReplyingTo(null)} className="btn-secondary text-xs px-4 py-2">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setReplyingTo(inq.id)} className="mt-3 text-xs font-medium text-accent hover:underline">Reply</button>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
