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
});
