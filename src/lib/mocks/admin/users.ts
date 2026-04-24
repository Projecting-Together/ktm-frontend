import type { AdminUser } from "@/lib/admin/types";

export const adminUsers: AdminUser[] = [
  {
    id: "u1",
    email: "admin@test.com",
    role: "user",
    status: "active",
    joinedAt: "2026-04-24T00:00:00.000Z",
  },
  {
    id: "u2",
    email: "agent@test.com",
    role: "agent",
    status: "active",
    joinedAt: "2026-04-19T08:30:00.000Z",
  },
  {
    id: "u3",
    email: "seller@test.com",
    role: "user",
    status: "suspended",
    joinedAt: "2026-04-17T12:00:00.000Z",
  },
];
