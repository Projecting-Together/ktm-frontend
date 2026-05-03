"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReceivedVisitRequests, confirmVisit } from "@/lib/api/client";
import { formatDate } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { toast } from "sonner";

export default function LeadInboxVisitsPage() {
  const qc = useQueryClient();
  const { data: visits, isLoading } = useQuery({
    queryKey: ["visits", "received"],
    queryFn: async () => {
      const res = await getReceivedVisitRequests();
      if (res.error) throw new Error(res.error.message);
      return res.data ?? [];
    },
  });

  const { mutate: confirm } = useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) =>
      confirmVisit(id, date).then((r) => {
        if (r.error) throw new Error(r.error.message);
        return r.data!;
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["visits", "received"] });
      toast.success("Visit confirmed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Visit requests</h1>
      <p className="text-muted-foreground mb-6">Requests from renters to visit your listings — confirm or propose a time.</p>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : !visits?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold">No visit requests yet</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {visits.map((v) => (
            <div key={v.id} className="rounded-xl border border-border bg-card p-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm">Visit Request</p>
                <p className="text-sm text-muted-foreground">Preferred: {formatDate(v.preferred_date)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                    v.status === "confirmed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {v.status}
                </span>
                {v.status === "pending" && (
                  <button type="button" onClick={() => confirm({ id: v.id, date: v.preferred_date })} className="btn-primary text-xs px-3 py-1.5">
                    Confirm
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
