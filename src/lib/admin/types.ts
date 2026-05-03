import type { ListingStatus, ListingType } from "@/lib/api/types";

/** Same codes as public listings (`ListingType`); avoid duplicating the union in admin-only types. */
export type AdminListingType = ListingType;

/** Admin table filters use a subset of full listing lifecycle (`ListingStatus`). */
export const ADMIN_LISTING_STATUS_VALUES = ["pending", "active", "sold", "rejected"] as const satisfies readonly ListingStatus[];
export type AdminListingStatus = (typeof ADMIN_LISTING_STATUS_VALUES)[number];
export type AdminTransactionStatus = "paid" | "pending" | "failed" | "refunded";
export type AdminPaymentMethod = "wallet" | "bank_transfer" | "cash";
export type AdminUserRole = "user" | "admin";
export type AdminUserStatus = "active" | "inactive" | "suspended";

/** Keys match `admin-dashboard.json` `kpis[].key`; single source for types + Zod. */
export const ADMIN_DASHBOARD_KPI_KEYS = [
  "totalListings",
  "pendingListings",
  "activeUsers",
  "monthlyRevenue",
] as const;
export type AdminDashboardKpiKey = (typeof ADMIN_DASHBOARD_KPI_KEYS)[number];

export interface AdminDashboardKpi {
  key: AdminDashboardKpiKey;
  label: string;
  value: number;
  deltaPercent: number;
}

export interface AdminDashboardActivity {
  id: string;
  actor: string;
  action: string;
  createdAt: string;
}

export interface AdminListing {
  id: string;
  title: string;
  type: AdminListingType;
  status: AdminListingStatus;
  city: string;
  priceNpr: number;
  createdAt: string;
}

export interface AdminTransaction {
  id: string;
  userId: string;
  listingId: string;
  amountNpr: number;
  status: AdminTransactionStatus;
  paymentMethod: AdminPaymentMethod;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  joinedAt: string;
}

export interface AdminAnalyticsPoint {
  date: string;
  listings: number;
  transactions: number;
  users: number;
}
