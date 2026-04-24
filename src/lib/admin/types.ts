export type AdminListingType = "apartment" | "room" | "house" | "studio" | "commercial";
export type AdminListingStatus = "pending" | "active" | "sold" | "rejected";
export type AdminTransactionStatus = "paid" | "pending" | "failed" | "refunded";
export type AdminPaymentMethod = "wallet" | "bank_transfer" | "cash";
export type AdminUserRole = "user" | "agent" | "moderator" | "admin";
export type AdminUserStatus = "active" | "inactive" | "suspended";

export interface AdminDashboardKpi {
  key: "totalListings" | "pendingListings" | "activeUsers" | "monthlyRevenue";
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
