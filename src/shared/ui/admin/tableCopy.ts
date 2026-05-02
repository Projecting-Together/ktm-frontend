/** Repeated column titles across admin tables where wording matches legacy UI. */
export const ADMIN_TABLE_SHARED = {
  columnListing: "Listing",
  columnStatus: "Status",
  columnCreated: "Created",
  columnActions: "Actions",
} as const;

export const ADMIN_PAGE_LISTINGS = {
  title: "Listing Management",
  subtitle: "Search, review, and moderate listings from one place.",
  searchPlaceholder: "Search by title, id, or city",
} as const;

export const ADMIN_LISTINGS_TABLE = {
  selectAllAria: "Select all listings",
  columnListing: ADMIN_TABLE_SHARED.columnListing,
  columnType: "Type",
  columnStatus: ADMIN_TABLE_SHARED.columnStatus,
  columnCreated: ADMIN_TABLE_SHARED.columnCreated,
  columnActions: ADMIN_TABLE_SHARED.columnActions,
  actionView: "View",
  actionEdit: "Edit",
  actionDelete: "Delete",
  actionApprove: "Approve",
  actionReject: "Reject",
} as const;

export const ADMIN_PAGE_USERS = {
  title: "User Management",
  subtitle: "Manage account roles, status, and recovery actions.",
  searchPlaceholder: "Search by email or id",
} as const;

export const ADMIN_USERS_TABLE = {
  columnUser: "User",
  columnRole: "Role",
  columnStatus: ADMIN_TABLE_SHARED.columnStatus,
  columnJoined: "Joined",
  columnActions: ADMIN_TABLE_SHARED.columnActions,
} as const;

export const ADMIN_PAGE_TRANSACTIONS = {
  title: "Transactions",
  subtitle: "Track payment activity, update statuses, and export filtered records.",
  searchPlaceholder: "Search by transaction, listing, user, or method",
} as const;

export const ADMIN_TRANSACTIONS_TABLE = {
  columnTransaction: "Transaction",
  columnListing: ADMIN_TABLE_SHARED.columnListing,
  columnAmount: "Amount",
  columnMethod: "Method",
  columnStatus: ADMIN_TABLE_SHARED.columnStatus,
  columnCreated: ADMIN_TABLE_SHARED.columnCreated,
  columnUpdateStatus: "Update Status",
} as const;
