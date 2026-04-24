import { mapProfileDto } from "@/lib/contracts/profile";

describe("mapProfileDto", () => {
  it("builds fullName from first and last name", () => {
    const result = mapProfileDto({
      id: "agent-1",
      email: "ramesh@example.com",
      role: "agent",
      profile: {
        first_name: "Ramesh",
        last_name: "Sharma",
      },
    });

    expect(result.fullName).toBe("Ramesh Sharma");
  });

  it("falls back to email prefix when name fields are missing", () => {
    const result = mapProfileDto({
      id: "agent-2",
      email: "sita.thapa@example.com",
      role: "owner",
      profile: {
        first_name: "",
        last_name: " ",
      },
    });

    expect(result.fullName).toBe("sita.thapa");
  });

  it("falls back to U initials when no usable identity text exists", () => {
    const result = mapProfileDto({
      id: "agent-3",
      email: "",
      role: "agent",
      profile: {
        first_name: " ",
        last_name: null,
      },
    });

    expect(result.initials).toBe("U");
  });

  it("defaults activeListings to zero when stats are missing", () => {
    const result = mapProfileDto({
      id: "agent-4",
      email: "active@example.com",
      role: "owner",
    });

    expect(result.activeListings).toBe(0);
  });

  it("handles null optional profile fields safely", () => {
    const result = mapProfileDto({
      id: "agent-5",
      email: "nullsafe@example.com",
      role: "agent",
      profile: {
        phone: null,
        bio: null,
        whatsapp: null,
        viber: null,
        avatar_url: null,
      },
      stats: {
        active_listings: 3,
      },
    });

    expect(result.phone).toBe("");
    expect(result.bio).toBe("");
    expect(result.whatsapp).toBe("");
    expect(result.viber).toBe("");
    expect(result.avatarUrl).toBeNull();
    expect(result.activeListings).toBe(3);
  });
});
