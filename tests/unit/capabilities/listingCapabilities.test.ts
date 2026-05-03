import { resolveListingCapabilities } from "@/lib/capabilities/listingCapabilities";

describe("resolveListingCapabilities", () => {
  it("allows member (user) to create listing below free cap", () => {
    const result = resolveListingCapabilities({
      role: "user",
      activeListingCount: 1,
    });

    expect(result.activeListingCount).toBe(1);
    expect(result.canCreateWithoutUpgrade).toBe(true);
    expect(result.requiresAgentUpgrade).toBe(false);
  });

  it("blocks member (user) at or above free cap", () => {
    const atCap = resolveListingCapabilities({
      role: "user",
      activeListingCount: 2,
    });

    expect(atCap.activeListingCount).toBe(2);
    expect(atCap.canCreateWithoutUpgrade).toBe(false);
    expect(atCap.requiresAgentUpgrade).toBe(false);
  });

  it("keeps admin unlimited regardless of count", () => {
    const result = resolveListingCapabilities({
      role: "admin",
      activeListingCount: 20,
    });

    expect(result.activeListingCount).toBe(20);
    expect(result.canCreateWithoutUpgrade).toBe(true);
    expect(result.requiresAgentUpgrade).toBe(false);
  });

  it("sanitizes negative active listing count to zero", () => {
    const result = resolveListingCapabilities({
      role: "user",
      activeListingCount: -2,
    });

    expect(result.activeListingCount).toBe(0);
    expect(result.canCreateWithoutUpgrade).toBe(true);
    expect(result.requiresAgentUpgrade).toBe(false);
  });

  it("sanitizes non-finite active listing counts to zero", () => {
    const infinityResult = resolveListingCapabilities({
      role: "user",
      activeListingCount: Number.POSITIVE_INFINITY,
    });
    const nanResult = resolveListingCapabilities({
      role: "user",
      activeListingCount: Number.NaN,
    });

    expect(infinityResult.activeListingCount).toBe(0);
    expect(infinityResult.canCreateWithoutUpgrade).toBe(true);
    expect(infinityResult.requiresAgentUpgrade).toBe(false);

    expect(nanResult.activeListingCount).toBe(0);
    expect(nanResult.canCreateWithoutUpgrade).toBe(true);
    expect(nanResult.requiresAgentUpgrade).toBe(false);
  });
});
