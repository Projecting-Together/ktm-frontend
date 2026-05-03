"use client";
import { useQuery } from "@tanstack/react-query";
import { adminGetAuditLog } from "@/lib/api/client";
import { formatDate } from "@/lib/utils";

export default function AuditLogPage() {
  const page = 1;
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "audit-log", page],
    queryFn: async () => {
      const res = await adminGetAuditLog(page);
      if (res.error) throw new Error(res.error.message);
      return res.data!;
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Audit Log</h1>
      {isLoading ? (
        <div className="space-y-2">{Array.from({length:8}).map((_,i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Action</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Target</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Actor</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.items?.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{log.action}</td>
                  <td className="px-4 py-3 text-muted-foreground">{log.target_type}</td>
                  <td className="px-4 py-3 text-muted-foreground">{log.actor_id?.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(log.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
