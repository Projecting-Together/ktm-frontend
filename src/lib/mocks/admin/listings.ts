import type { AdminListing } from "@/lib/admin/types";

export const adminListings: AdminListing[] = [
  {
    id: "l1",
    title: "Sunrise Residency Apartment",
    type: "apartment",
    status: "pending",
    city: "Kathmandu",
    priceNpr: 45000000,
    createdAt: "2026-04-24T00:00:00.000Z",
  },
  {
    id: "l2",
    title: "Patan Commercial Space",
    type: "commercial",
    status: "active",
    city: "Lalitpur",
    priceNpr: 68000000,
    createdAt: "2026-04-20T09:15:00.000Z",
  },
  {
    id: "l3",
    title: "Bhaktapur Family House",
    type: "house",
    status: "rejected",
    city: "Bhaktapur",
    priceNpr: 39000000,
    createdAt: "2026-04-18T05:40:00.000Z",
  },
];
