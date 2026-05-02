import type {
  AdminDashboardActivity,
  AdminDashboardKpi,
  AdminListing,
  AdminListingStatus,
  AdminTransaction,
  AdminTransactionStatus,
  AdminUser,
} from "@/lib/admin/types";
import { adminFetchDashboardSummary } from "@/lib/api/client";
import {
  adminListingsCatalog as adminListings,
  adminTransactionsCatalog as adminTransactions,
  adminUiUsersCatalog as adminUsers,
} from "@/test-utils/fixtures";

interface PaginationParams {
  page?: number;
  pageSize?: number;
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ListingQueryParams extends PaginationParams {
  status?: AdminListingStatus;
  query?: string;
}

interface TransactionQueryParams extends PaginationParams {
  status?: AdminTransactionStatus;
  query?: string;
}

interface UserQueryParams extends PaginationParams {
  status?: AdminUser["status"];
  role?: AdminUser["role"];
  query?: string;
}

type AdminUserUpdatePatch = Partial<Omit<AdminUser, "id">>;

const listingStore: AdminListing[] = adminListings.map((item) => ({ ...item }));
const transactionStore: AdminTransaction[] = adminTransactions.map((item) => ({ ...item }));
const userStore: AdminUser[] = adminUsers.map((item) => ({ ...item }));

function normalizeQuery(value?: string): string {
  return value?.trim().toLowerCase() ?? "";
}

function paginate<T>(items: T[], params: PaginationParams): PaginatedResult<T> {
  const page = Number.isFinite(params.page) ? Math.max(1, params.page ?? 1) : 1;
  const pageSize = Math.max(1, params.pageSize ?? 20);
  const total = items.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
}

async function getListings(params: ListingQueryParams = {}): Promise<PaginatedResult<AdminListing>> {
  const query = normalizeQuery(params.query);

  const filtered = listingStore.filter((item) => {
    if (params.status && item.status !== params.status) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [item.id, item.title, item.city].some((field) => field.toLowerCase().includes(query));
  });

  const paginated = paginate(filtered, params);
  return {
    ...paginated,
    items: paginated.items.map((item) => ({ ...item })),
  };
}

async function bulkUpdateListingStatus(
  ids: string[],
  status: AdminListingStatus,
): Promise<{ updatedCount: number; items: AdminListing[] }> {
  const idSet = new Set(ids);
  const updatedItems: AdminListing[] = [];

  for (const item of listingStore) {
    if (idSet.has(item.id)) {
      item.status = status;
      updatedItems.push({ ...item });
    }
  }

  return { updatedCount: updatedItems.length, items: updatedItems };
}

async function bulkDeleteListings(ids: string[]): Promise<{ deletedCount: number }> {
  const idSet = new Set(ids);
  const next = listingStore.filter((item) => !idSet.has(item.id));
  const deletedCount = listingStore.length - next.length;
  listingStore.splice(0, listingStore.length, ...next);

  return { deletedCount };
}

async function getTransactions(params: TransactionQueryParams = {}): Promise<PaginatedResult<AdminTransaction>> {
  const query = normalizeQuery(params.query);

  const filtered = transactionStore.filter((item) => {
    if (params.status && item.status !== params.status) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [item.id, item.userId, item.listingId, item.paymentMethod].some((field) =>
      field.toLowerCase().includes(query),
    );
  });

  const paginated = paginate(filtered, params);
  return {
    ...paginated,
    items: paginated.items.map((item) => ({ ...item })),
  };
}

async function updateTransactionStatus(
  id: string,
  status: AdminTransactionStatus,
): Promise<AdminTransaction | null> {
  const transaction = transactionStore.find((item) => item.id === id);
  if (!transaction) {
    return null;
  }

  transaction.status = status;
  return { ...transaction };
}

async function getUsers(params: UserQueryParams = {}): Promise<PaginatedResult<AdminUser>> {
  const query = normalizeQuery(params.query);

  const filtered = userStore.filter((item) => {
    if (params.status && item.status !== params.status) {
      return false;
    }

    if (params.role && item.role !== params.role) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [item.id, item.email].some((field) => field.toLowerCase().includes(query));
  });

  const paginated = paginate(filtered, params);
  return {
    ...paginated,
    items: paginated.items.map((item) => ({ ...item })),
  };
}

async function updateUser(id: string, patch: AdminUserUpdatePatch): Promise<AdminUser | null> {
  const user = userStore.find((item) => item.id === id);
  if (!user) {
    return null;
  }

  const { id: _ignoredId, ...safePatch } = patch as AdminUserUpdatePatch & { id?: string };
  void _ignoredId;
  Object.assign(user, safePatch);
  return { ...user };
}

async function deleteUser(id: string): Promise<{ deleted: boolean }> {
  const next = userStore.filter((item) => item.id !== id);
  const deleted = next.length !== userStore.length;
  userStore.splice(0, userStore.length, ...next);

  return { deleted };
}

async function forcePasswordReset(id: string): Promise<{ reset: boolean }> {
  const user = userStore.find((item) => item.id === id);
  return { reset: Boolean(user) };
}

async function getDashboardSummary(): Promise<{ kpis: AdminDashboardKpi[]; activities: AdminDashboardActivity[] }> {
  const res = await adminFetchDashboardSummary();
  if (res.error) throw new Error(res.error.message);
  if (!res.data) throw new Error("Dashboard summary response is empty");
  return res.data;
}

export const adminService = {
  getListings,
  bulkUpdateListingStatus,
  bulkDeleteListings,
  getTransactions,
  updateTransactionStatus,
  getUsers,
  updateUser,
  deleteUser,
  forcePasswordReset,
  getDashboardSummary,
};
