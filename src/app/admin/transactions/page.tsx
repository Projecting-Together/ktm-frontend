"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { FilterToolbar } from "@/components/admin/FilterToolbar";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { adminService } from "@/lib/admin/service";
import type { AdminTransaction, AdminTransactionStatus } from "@/lib/admin/types";

const TRANSACTION_STATUSES: Array<AdminTransactionStatus | ""> = ["", "paid", "pending", "failed", "refunded"];
const STATUS_UPDATE_OPTIONS: AdminTransactionStatus[] = ["paid", "pending", "failed", "refunded"];

function toBadgeStatus(status: AdminTransactionStatus): "active" | "pending" | "rejected" | "inactive" {
  if (status === "paid") {
    return "active";
  }
  if (status === "pending") {
    return "pending";
  }
  if (status === "failed") {
    return "rejected";
  }
  return "inactive";
}

function toCsv(rows: AdminTransaction[]): string {
  const header = ["id", "userId", "listingId", "amountNpr", "status", "paymentMethod", "createdAt"];
  const csvRows = rows.map((row) => [
    row.id,
    row.userId,
    row.listingId,
    String(row.amountNpr),
    row.status,
    row.paymentMethod,
    row.createdAt,
  ]);

  return [header, ...csvRows]
    .map((columns) =>
      columns
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");
}

export default function AdminTransactionsPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminTransactionStatus | "">("");
  const [feedback, setFeedback] = useState("");

  const transactionsQuery = useQuery({
    queryKey: ["admin", "transactions", query, statusFilter],
    queryFn: () => adminService.getTransactions({ query, status: statusFilter || undefined }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AdminTransactionStatus }) => adminService.updateTransactionStatus(id, status),
    onSuccess: async (updatedTransaction) => {
      if (!updatedTransaction) {
        setFeedback("Transaction update failed.");
        return;
      }

      setFeedback(`Transaction ${updatedTransaction.id} updated to ${updatedTransaction.status}.`);
      await queryClient.invalidateQueries({ queryKey: ["admin", "transactions"] });
    },
  });

  const rows = useMemo(() => transactionsQuery.data?.items ?? [], [transactionsQuery.data?.items]);

  const handleExportCsv = () => {
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "transactions-export.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setFeedback(`Exported ${rows.length} transaction(s) to CSV.`);
  };

  const columns: DataTableColumn<AdminTransaction>[] = [
    {
      key: "id",
      header: "Transaction",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.id}</p>
          <p className="text-xs text-muted-foreground">User {row.userId}</p>
        </div>
      ),
    },
    {
      key: "listingId",
      header: "Listing",
      cell: (row) => row.listingId,
    },
    {
      key: "amountNpr",
      header: "Amount",
      cell: (row) => `NPR ${row.amountNpr.toLocaleString("en-US")}`,
    },
    {
      key: "paymentMethod",
      header: "Method",
      cell: (row) => <span className="capitalize">{row.paymentMethod.replaceAll("_", " ")}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={toBadgeStatus(row.status)} label={row.status} className="capitalize" />,
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (row) => new Date(row.createdAt).toLocaleDateString("en-US"),
    },
    {
      key: "actions",
      header: "Update Status",
      cell: (row) => (
        <label className="flex items-center gap-2">
          <span className="sr-only">{`Update status for transaction ${row.id}`}</span>
          <select
            aria-label={`Update status for transaction ${row.id}`}
            value={row.status}
            className="h-9 rounded-md border border-border bg-background px-2 text-xs capitalize"
            onChange={(event) =>
              updateStatusMutation.mutate({ id: row.id, status: event.target.value as AdminTransactionStatus })
            }
          >
            {STATUS_UPDATE_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold mb-1">Transactions</h1>
        <p className="text-muted-foreground">Track payment activity, update statuses, and export filtered records.</p>
      </div>

      <FilterToolbar
        search={
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by transaction, listing, user, or method"
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          />
        }
        filters={
          <select
            aria-label="Filter by transaction status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as AdminTransactionStatus | "")}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm capitalize"
          >
            <option value="">All Statuses</option>
            {TRANSACTION_STATUSES.filter(Boolean).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        }
        actions={
          <button
            type="button"
            onClick={handleExportCsv}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium"
          >
            Export CSV
          </button>
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
        emptyState={transactionsQuery.isLoading ? "Loading transactions..." : "No transactions found for current filters."}
      />
    </div>
  );
}
