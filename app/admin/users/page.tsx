"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminGetUsers, adminSuspendUser } from "@/lib/api/client";
import { formatDate } from "@/lib/utils";
import { ShieldOff } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", page],
    queryFn: async () => {
      const res = await adminGetUsers(page);
      if (res.error) throw new Error(res.error.message);
      return res.data!;
    },
  });

  const { mutate: suspend } = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminSuspendUser(id, reason).then(r => { if (r.error) throw new Error(r.error.message); return r.data!; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "users"] }); toast.success("User suspended"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      {isLoading ? (
        <div className="space-y-3">{Array.from({length:5}).map((_,i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">User</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Joined</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.items?.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{user.profile?.first_name ? `${user.profile.first_name} ${user.profile.last_name ?? ""}` : user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </td>
                  <td className="px-4 py-3 capitalize">{user.role}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                      user.status === "active" ? "bg-emerald-100 text-emerald-700" :
                      user.status === "suspended" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                    }`}>{user.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3">
                    {user.status === "active" && (
                      <button onClick={() => { if (confirm("Suspend this user?")) suspend({ id: user.id, reason: "Violation of terms" }); }}
                        className="flex items-center gap-1 text-xs text-destructive hover:underline">
                        <ShieldOff className="h-3 w-3" /> Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
