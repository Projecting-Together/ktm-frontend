import type {
  AdminAnalyticsPoint,
  AdminDashboardActivity,
  AdminDashboardKpi,
  AdminListing,
  AdminListingStatus,
  AdminTransaction,
  AdminTransactionStatus,
  AdminUser,
} from "@/lib/admin/types";
import { adminAnalyticsSeries } from "@/lib/mocks/admin/analytics";
import { adminDashboardActivities, adminDashboardKpis } from "@/lib/mocks/admin/dashboard";
import { adminListings } from "@/lib/mocks/admin/listings";
import { adminTransactions } from "@/lib/mocks/admin/transactions";
import { adminUsers } from "@/lib/mocks/admin/users";

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

interface AnalyticsParams {
  dateRange?: "last-7-days" | "last-30-days" | "last-90-days";
  city?: string;
  listingType?: string;
  from?: string;
  to?: string;
}

type AdminUserUpdatePatch = Partial<Omit<AdminUser, "id">>;

const listingStore: AdminListing[] = adminListings.map((item) => ({ ...item }));
const transactionStore: AdminTransaction[] = adminTransactions.map((item) => ({ ...item }));
const userStore: AdminUser[] = adminUsers.map((item) => ({ ...item }));

function normalizeQuery(value?: string): string {
  return value?.trim().toLowerCase() ?? "";
}

function toDateOnlyIso(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function subtractDaysIso(dateIso: string, days: number): string {
  const anchor = new Date(`${dateIso}T00:00:00.000Z`);
  anchor.setUTCDate(anchor.getUTCDate() - days);
  return toDateOnlyIso(anchor);
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
  return {
    kpis: adminDashboardKpis.map((item) => ({ ...item })),
    activities: adminDashboardActivities.map((item) => ({ ...item })),
  };
}

async function getAnalytics(params: AnalyticsParams = {}): Promise<AdminAnalyticsPoint[]> {
  const latestSeriesDate = adminAnalyticsSeries.reduce((latest, point) => (point.date > latest ? point.date : latest), "1970-01-01");
  const rangeDays: Record<NonNullable<AnalyticsParams["dateRange"]>, number> = {
    "last-7-days": 7,
    "last-30-days": 30,
    "last-90-days": 90,
  };
  const effectiveTo = params.to ?? (params.dateRange ? latestSeriesDate : undefined);
  const effectiveFrom =
    params.from ??
    (params.dateRange && effectiveTo ? subtractDaysIso(effectiveTo, rangeDays[params.dateRange] - 1) : undefined);
  const cityFactor =
    params.city && params.city !== "all-cities"
      ? params.city === "kathmandu"
        ? 1
        : params.city === "lalitpur"
          ? 0.7
          : 0.5
      : 1;
  const listingTypeFactor =
    params.listingType && params.listingType !== "all-types"
      ? params.listingType === "apartment"
        ? 1
        : params.listingType === "house"
          ? 0.85
          : params.listingType === "room"
            ? 0.65
            : 0.55
      : 1;
  const scaleFactor = cityFactor * listingTypeFactor;

  return adminAnalyticsSeries
    .filter((item) => {
      if (effectiveFrom && item.date < effectiveFrom) {
        return false;
      }

      if (effectiveTo && item.date > effectiveTo) {
        return false;
      }

      return true;
    })
    .map((item) => ({
      ...item,
      listings: Math.max(0, Math.round(item.listings * scaleFactor)),
      transactions: Math.max(0, Math.round(item.transactions * scaleFactor)),
      users: Math.max(0, Math.round(item.users * scaleFactor)),
    }));
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
  getAnalytics,
};
