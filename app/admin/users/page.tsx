"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { FilterToolbar } from "@/components/admin/FilterToolbar";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { adminService } from "@/lib/admin/service";
import type { AdminUser, AdminUserRole, AdminUserStatus } from "@/lib/admin/types";

const USER_ROLES: AdminUserRole[] = ["user", "agent", "moderator", "admin"];
const USER_STATUSES: Array<AdminUserStatus | ""> = ["", "active", "inactive", "suspended"];

function toBadgeStatus(status: AdminUserStatus): "active" | "inactive" | "rejected" {
  if (status === "suspended") {
    return "rejected";
  }

  return status;
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminUserStatus | "">("");
  const [roleFilter, setRoleFilter] = useState<AdminUserRole | "">("");
  const [feedback, setFeedback] = useState("");

  const usersQuery = useQuery({
    queryKey: ["admin", "users", query, statusFilter, roleFilter],
    queryFn: () =>
      adminService.getUsers({
        query: query || undefined,
        status: statusFilter || undefined,
        role: roleFilter || undefined,
      }),
  });

  const refreshUsers = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
  };

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<Pick<AdminUser, "role" | "status">>;
    }) => {
      const user = await adminService.updateUser(id, patch);
      if (!user) {
        throw new Error("User not found.");
      }
      return user;
    },
    onSuccess: async () => {
      await refreshUsers();
    },
  });

  const forcePasswordResetMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await adminService.forcePasswordReset(id);
      if (!result.reset) {
        throw new Error("Unable to force password reset.");
      }
      return result;
    },
    onSuccess: async () => {
      await refreshUsers();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await adminService.deleteUser(id);
      if (!result.deleted) {
        throw new Error("User not found.");
      }
      return result;
    },
    onSuccess: async () => {
      await refreshUsers();
    },
  });

  const rows = usersQuery.data?.items ?? [];

  const columns: DataTableColumn<AdminUser>[] = useMemo(
    () => [
      {
        key: "email",
        header: "User",
        cell: (row) => <span className="font-medium">{row.email}</span>,
      },
      {
        key: "role",
        header: "Role",
        cell: (row) => (
          <select
            aria-label={`Change role for user ${row.id}`}
            value={row.role}
            onChange={(event) => {
              const nextRole = event.target.value as AdminUserRole;
              updateMutation.mutate(
                { id: row.id, patch: { role: nextRole } },
                {
                  onSuccess: () => {
                    setFeedback(`Role for user ${row.id} updated to ${nextRole}.`);
                  },
                },
              );
            }}
            className="h-9 rounded-md border border-border bg-background px-2 text-sm capitalize"
          >
            {USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (row) => <StatusBadge status={toBadgeStatus(row.status)} label={row.status} className="capitalize" />,
      },
      {
        key: "joinedAt",
        header: "Joined",
        cell: (row) => new Date(row.joinedAt).toLocaleDateString("en-US"),
      },
      {
        key: "actions",
        header: "Actions",
        cell: (row) => {
          const isActive = row.status === "active";

          return (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-label={isActive ? `Deactivate user ${row.id}` : `Activate user ${row.id}`}
                className="rounded border border-border px-2 py-1 text-xs"
                onClick={() => {
                  if (isActive && !window.confirm(`Deactivate user ${row.id}?`)) {
                    return;
                  }

                  const nextStatus: AdminUserStatus = isActive ? "inactive" : "active";
                  updateMutation.mutate(
                    { id: row.id, patch: { status: nextStatus } },
                    {
                      onSuccess: () => {
                        setFeedback(`User ${row.id} ${nextStatus === "active" ? "activated" : "deactivated"}.`);
                      },
                    },
                  );
                }}
              >
                {isActive ? "Deactivate" : "Activate"}
              </button>
              <button
                type="button"
                aria-label={`Suspend user ${row.id}`}
                className="rounded bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700"
                onClick={() => {
                  if (!window.confirm(`Suspend user ${row.id}?`)) {
                    return;
                  }

                  updateMutation.mutate(
                    { id: row.id, patch: { status: "suspended" } },
                    {
                      onSuccess: () => {
                        setFeedback(`User ${row.id} suspended.`);
                      },
                    },
                  );
                }}
              >
                Suspend
              </button>
              <button
                type="button"
                aria-label={`Force password reset for user ${row.id}`}
                className="rounded border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-700"
                onClick={() => {
                  if (!window.confirm(`Force password reset for user ${row.id}?`)) {
                    return;
                  }

                  forcePasswordResetMutation.mutate(row.id, {
                    onSuccess: () => {
                      setFeedback(`Password reset forced for user ${row.id}.`);
                    },
                  });
                }}
              >
                Force Reset
              </button>
              <button
                type="button"
                aria-label={`Delete user ${row.id}`}
                className="rounded border border-rose-300 bg-rose-50 px-2 py-1 text-xs text-rose-700"
                onClick={() => {
                  if (!window.confirm(`Delete user ${row.id}? This cannot be undone.`)) {
                    return;
                  }

                  deleteMutation.mutate(row.id, {
                    onSuccess: () => {
                      setFeedback(`User ${row.id} deleted.`);
                    },
                  });
                }}
              >
                Delete
              </button>
            </div>
          );
        },
      },
    ],
    [deleteMutation, forcePasswordResetMutation, updateMutation],
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold mb-1">User Management</h1>
        <p className="text-muted-foreground">Manage account roles, status, and recovery actions.</p>
      </div>

      <FilterToolbar
        search={
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by email or id"
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          />
        }
        filters={
          <>
            <select
              aria-label="Filter users by role"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as AdminUserRole | "")}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm capitalize"
            >
              <option value="">All Roles</option>
              {USER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter users by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as AdminUserStatus | "")}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm capitalize"
            >
              <option value="">All Statuses</option>
              {USER_STATUSES.filter(Boolean).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </>
        }
      />

      {feedback ? (
        <div role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {feedback}
        </div>
      ) : null}

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        emptyState={usersQuery.isLoading ? "Loading users..." : "No users found for current filters."}
      />
    </div>
  );
}
