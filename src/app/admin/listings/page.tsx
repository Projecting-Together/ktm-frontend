"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { FilterToolbar } from "@/components/admin/FilterToolbar";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { adminService } from "@/lib/admin/service";
import type { AdminListing, AdminListingStatus, AdminListingType } from "@/lib/admin/types";
import { ADMIN_LISTING_STATUS_FILTER, ADMIN_LISTING_TYPE_FILTER } from "@/lib/constants/adminUi";
import { ADMIN_LISTINGS_TABLE, ADMIN_PAGE_LISTINGS } from "@/shared/ui/admin/tableCopy";

const LISTING_STATUSES = ADMIN_LISTING_STATUS_FILTER;
const LISTING_TYPES = ADMIN_LISTING_TYPE_FILTER;

function toBadgeStatus(status: AdminListingStatus): "pending" | "active" | "rejected" | "inactive" {
  if (status === "sold") {
    return "inactive";
  }

  return status;
}

export default function AdminListingsPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminListingStatus | "">("");
  const [typeFilter, setTypeFilter] = useState<AdminListingType | "">("");
  const [cityFilter, setCityFilter] = useState("");
  const [createdAfter, setCreatedAfter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>("");

  const listingsQuery = useQuery({
    queryKey: ["admin", "listings", query, statusFilter],
    queryFn: () => adminService.getListings({ query, status: statusFilter || undefined }),
  });

  const refreshListings = async () => {
    setSelectedIds([]);
    await queryClient.invalidateQueries({ queryKey: ["admin", "listings"] });
  };

  const approveMutation = useMutation({
    mutationFn: async (ids: string[]) => adminService.bulkUpdateListingStatus(ids, "active"),
    onSuccess: async (result) => {
      setFeedback(`Bulk approved ${result.updatedCount} listing(s).`);
      await refreshListings();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => adminService.bulkUpdateListingStatus([id], "rejected"),
    onSuccess: async () => {
      setFeedback("Listing rejected.");
      await refreshListings();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => adminService.bulkDeleteListings(ids),
    onSuccess: async (result) => {
      setFeedback(`Deleted ${result.deletedCount} listing(s).`);
      await refreshListings();
    },
  });

  const rows = useMemo(() => {
    const cityQuery = cityFilter.trim().toLowerCase();
    const minCreatedAt = createdAfter ? new Date(createdAfter).getTime() : Number.NEGATIVE_INFINITY;

    return (listingsQuery.data?.items ?? []).filter((item) => {
      if (typeFilter && item.type !== typeFilter) {
        return false;
      }

      if (cityQuery && !item.city.toLowerCase().includes(cityQuery)) {
        return false;
      }

      if (Number.isFinite(minCreatedAt) && new Date(item.createdAt).getTime() < minCreatedAt) {
        return false;
      }

      return true;
    });
  }, [cityFilter, createdAfter, listingsQuery.data?.items, typeFilter]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allVisibleSelected = rows.length > 0 && rows.every((row) => selectedSet.has(row.id));

  useEffect(() => {
    const visibleRowIds = new Set(rows.map((row) => row.id));
    setSelectedIds((current) => current.filter((id) => visibleRowIds.has(id)));
  }, [rows]);

  const toggleRowSelection = (id: string) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const toggleSelectAllVisible = () => {
    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !rows.some((row) => row.id === id));
      }

      const next = new Set(current);
      rows.forEach((row) => next.add(row.id));
      return Array.from(next);
    });
  };

  const columns: DataTableColumn<AdminListing>[] = [
    {
      key: "select",
      header: (
        <input
          type="checkbox"
          aria-label={ADMIN_LISTINGS_TABLE.selectAllAria}
          checked={allVisibleSelected}
          onChange={toggleSelectAllVisible}
        />
      ),
      className: "w-12",
      cell: (row) => (
        <input
          type="checkbox"
          aria-label={`Select listing ${row.id}`}
          checked={selectedSet.has(row.id)}
          onChange={() => toggleRowSelection(row.id)}
        />
      ),
    },
    {
      key: "title",
      header: ADMIN_LISTINGS_TABLE.columnListing,
      cell: (row) => (
        <div>
          <p className="font-medium">{row.title}</p>
          <p className="text-xs text-muted-foreground">{row.city}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: ADMIN_LISTINGS_TABLE.columnType,
      cell: (row) => <span className="capitalize">{row.type}</span>,
    },
    {
      key: "status",
      header: ADMIN_LISTINGS_TABLE.columnStatus,
      cell: (row) => <StatusBadge status={toBadgeStatus(row.status)} label={row.status === "sold" ? "Sold" : undefined} />,
    },
    {
      key: "createdAt",
      header: ADMIN_LISTINGS_TABLE.columnCreated,
      cell: (row) => new Date(row.createdAt).toLocaleDateString("en-US"),
    },
    {
      key: "actions",
      header: ADMIN_LISTINGS_TABLE.columnActions,
      cell: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/listings/${row.id}`} className="rounded border border-border px-2 py-1 text-xs">
            {ADMIN_LISTINGS_TABLE.actionView}
          </Link>
          <button type="button" className="rounded border border-border px-2 py-1 text-xs">
            {ADMIN_LISTINGS_TABLE.actionEdit}
          </button>
          <button
            type="button"
            className="rounded border border-border px-2 py-1 text-xs"
            onClick={() => deleteMutation.mutate([row.id])}
          >
            {ADMIN_LISTINGS_TABLE.actionDelete}
          </button>
          <button
            type="button"
            className="rounded bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"
            onClick={() => approveMutation.mutate([row.id])}
          >
            {ADMIN_LISTINGS_TABLE.actionApprove}
          </button>
          <button
            type="button"
            className="rounded bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700"
            onClick={() => rejectMutation.mutate(row.id)}
          >
            {ADMIN_LISTINGS_TABLE.actionReject}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold mb-1">{ADMIN_PAGE_LISTINGS.title}</h1>
        <p className="text-muted-foreground">{ADMIN_PAGE_LISTINGS.subtitle}</p>
      </div>

      <FilterToolbar
        search={
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={ADMIN_PAGE_LISTINGS.searchPlaceholder}
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          />
        }
        filters={
          <>
            <select
              aria-label="Filter by type"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as AdminListingType | "")}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm capitalize"
            >
              <option value="">All Types</option>
              {LISTING_TYPES.filter(Boolean).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as AdminListingStatus | "")}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm capitalize"
            >
              <option value="">All Statuses</option>
              {LISTING_STATUSES.filter(Boolean).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <input
              aria-label="Filter by city"
              value={cityFilter}
              onChange={(event) => setCityFilter(event.target.value)}
              placeholder="City"
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            />
            <input
              aria-label="Filter by date"
              type="date"
              value={createdAfter}
              onChange={(event) => setCreatedAfter(event.target.value)}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            />
          </>
        }
      />

      <BulkActionBar
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        actions={
          <>
            <button
              type="button"
              onClick={() => approveMutation.mutate(selectedIds)}
              className="rounded-md bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700"
            >
              Bulk Approve
            </button>
            <button
              type="button"
              onClick={() => deleteMutation.mutate(selectedIds)}
              className="rounded-md bg-rose-100 px-3 py-1.5 text-sm font-medium text-rose-700"
            >
              Bulk Delete
            </button>
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
        emptyState={listingsQuery.isLoading ? "Loading listings..." : "No listings found for current filters."}
      />
    </div>
  );
}
