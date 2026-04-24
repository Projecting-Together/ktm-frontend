import { resolveListingCapabilities } from "@/lib/capabilities/listingCapabilities";

describe("resolveListingCapabilities", () => {
  it("allows renter to create listing below cap", () => {
    const result = resolveListingCapabilities({
      role: "renter",
      activeListingCount: 1,
    });

    expect(result.activeListingCount).toBe(1);
    expect(result.canCreateWithoutUpgrade).toBe(true);
    expect(result.requiresAgentUpgrade).toBe(false);
  });

  it("requires upgrade for renter at cap", () => {
    const result = resolveListingCapabilities({
      role: "renter",
      activeListingCount: 2,
    });

    expect(result.activeListingCount).toBe(2);
    expect(result.canCreateWithoutUpgrade).toBe(false);
    expect(result.requiresAgentUpgrade).toBe(true);
  });

  it("requires upgrade for owner above cap", () => {
    const result = resolveListingCapabilities({
      role: "owner",
      activeListingCount: 3,
    });

    expect(result.activeListingCount).toBe(3);
    expect(result.canCreateWithoutUpgrade).toBe(false);
    expect(result.requiresAgentUpgrade).toBe(true);
  });

  it("keeps agent unlimited", () => {
    const result = resolveListingCapabilities({
      role: "agent",
      activeListingCount: 99,
    });

    expect(result.activeListingCount).toBe(99);
    expect(result.canCreateWithoutUpgrade).toBe(true);
    expect(result.requiresAgentUpgrade).toBe(false);
  });

  it("keeps admin unlimited", () => {
    const result = resolveListingCapabilities({
      role: "admin",
      activeListingCount: 20,
    });

    expect(result.activeListingCount).toBe(20);
    expect(result.canCreateWithoutUpgrade).toBe(true);
    expect(result.requiresAgentUpgrade).toBe(false);
  });
});
