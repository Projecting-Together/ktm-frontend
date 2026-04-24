import {
  CONTENT_STATUSES,
  PUBLISHER_ROLES,
  canPublishNews,
} from "@/lib/contracts/news";

describe("news publishing contract", () => {
  it("defines expected content statuses", () => {
    expect(CONTENT_STATUSES).toEqual([
      "draft",
      "pending_review",
      "published",
      "rejected",
    ]);
  });

  it("defines expected publisher roles", () => {
    expect(PUBLISHER_ROLES).toEqual(["owner", "agent", "admin"]);
  });

  it("allows only agent and admin roles to publish news", () => {
    expect(canPublishNews("owner")).toBe(false);
    expect(canPublishNews("agent")).toBe(true);
    expect(canPublishNews("admin")).toBe(true);
  });
});
