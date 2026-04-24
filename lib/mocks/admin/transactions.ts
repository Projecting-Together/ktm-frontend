import type { AdminTransaction } from "@/lib/admin/types";

export const adminTransactions: AdminTransaction[] = [
  {
    id: "t1",
    userId: "u1",
    listingId: "l1",
    amountNpr: 50000,
    status: "paid",
    paymentMethod: "wallet",
    createdAt: "2026-04-24T00:00:00.000Z",
  },
  {
    id: "t2",
    userId: "u2",
    listingId: "l2",
    amountNpr: 150000,
    status: "pending",
    paymentMethod: "bank_transfer",
    createdAt: "2026-04-23T11:20:00.000Z",
  },
  {
    id: "t3",
    userId: "u3",
    listingId: "l3",
    amountNpr: 80000,
    status: "refunded",
    paymentMethod: "cash",
    createdAt: "2026-04-22T14:05:00.000Z",
  },
];
