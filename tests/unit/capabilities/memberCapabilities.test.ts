import type { User } from "@/lib/api/types";
import { resolveMemberCapabilities } from "@/lib/capabilities/memberCapabilities";

const baseUser = (over: Partial<User>): User => ({
  id: "u1",
  email: "a@b.com",
  role: "user",
  status: "active",
  is_verified: true,
  created_at: new Date().toISOString(),
  ...over,
});

describe("resolveMemberCapabilities", () => {
  it("denies all when user null", () => {
    expect(resolveMemberCapabilities({ user: null }).canUseMemberDashboard).toBe(false);
  });

  it("allows member dashboard for active user role user", () => {
    const c = resolveMemberCapabilities({ user: baseUser({}) });
    expect(c.canUseMemberDashboard).toBe(true);
    expect(c.canCreateListing).toBe(true);
    expect(c.canAccessAdminPortal).toBe(false);
  });

  it("allows admin portal flag for admin role", () => {
    const c = resolveMemberCapabilities({ user: baseUser({ role: "admin" }) });
    expect(c.canAccessAdminPortal).toBe(true);
    expect(c.canUseMemberDashboard).toBe(true);
  });

  it("prefers apiCapabilities when provided", () => {
    const c = resolveMemberCapabilities({
      user: baseUser({ role: "user" }),
      apiCapabilities: { canCreateListing: false },
    });
    expect(c.canCreateListing).toBe(false);
  });
});
