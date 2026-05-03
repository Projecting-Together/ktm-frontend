import type { AdminUserRole, AdminUserStatus } from "@/lib/admin/types";
import type { AdminListingStatus, AdminListingType } from "@/lib/admin/types";
import type { AdminTransactionStatus } from "@/lib/admin/types";
import { LISTING_TYPE_VALUES } from "@/lib/api/types";

export const ADMIN_USER_ROLES: readonly AdminUserRole[] = ["user", "admin"];

export const ADMIN_USER_STATUS_FILTER: Array<AdminUserStatus | ""> = [
  "",
  "active",
  "inactive",
  "suspended",
];

export const ADMIN_LISTING_STATUS_FILTER: Array<AdminListingStatus | ""> = [
  "",
  "pending",
  "active",
  "sold",
  "rejected",
];

export const ADMIN_LISTING_TYPE_FILTER: Array<AdminListingType | ""> = ["", ...LISTING_TYPE_VALUES];

export const ADMIN_TRANSACTION_STATUSES_FILTER: Array<"" | AdminTransactionStatus> = [
  "",
  "paid",
  "pending",
  "failed",
  "refunded",
];

export const ADMIN_TRANSACTION_STATUS_UPDATES: readonly AdminTransactionStatus[] = [
  "paid",
  "pending",
  "failed",
  "refunded",
];
