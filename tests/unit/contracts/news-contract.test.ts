import {
  CONTENT_STATUSES,
  PUBLISHER_ROLES,
  canModerateNewsTransition,
  canPublishNews,
  nextNewsStatusForSubmit,
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

  it("maps owner submit transition to pending_review", () => {
    expect(nextNewsStatusForSubmit("owner")).toBe("pending_review");
  });

  it("maps trusted agent and admin submit transitions to published", () => {
    expect(nextNewsStatusForSubmit("agent")).toBe("published");
    expect(nextNewsStatusForSubmit("admin")).toBe("published");
  });

  it("allows admin moderation transitions for approve/reject/unpublish paths", () => {
    expect(canModerateNewsTransition("pending_review", "published")).toBe(true);
    expect(canModerateNewsTransition("pending_review", "rejected")).toBe(true);
    expect(canModerateNewsTransition("published", "pending_review")).toBe(false);
  });
});
