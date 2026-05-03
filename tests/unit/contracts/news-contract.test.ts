import {
  CONTENT_STATUS_VALUES,
  PUBLISHER_ROLES,
  canModerateNewsTransition,
  canPublishNews,
  nextNewsStatusForSubmit,
} from "@/lib/contracts/news";

describe("news publishing contract", () => {
  it("defines expected content statuses", () => {
    expect(CONTENT_STATUS_VALUES).toEqual([
      "draft",
      "pending_review",
      "published",
      "rejected",
    ]);
  });

  it("defines expected publisher roles", () => {
    expect(PUBLISHER_ROLES).toEqual(["user", "admin"]);
  });

  it("allows only admin to publish news", () => {
    expect(canPublishNews("user")).toBe(false);
    expect(canPublishNews("admin")).toBe(true);
  });

  it("maps user submit transition to pending_review", () => {
    expect(nextNewsStatusForSubmit("user")).toBe("pending_review");
  });

  it("maps admin submit transition to published when publishing directly", () => {
    expect(nextNewsStatusForSubmit("admin")).toBe("published");
  });

  it("allows admin moderation transitions for approve/reject/unpublish paths", () => {
    expect(canModerateNewsTransition("pending_review", "published")).toBe(true);
    expect(canModerateNewsTransition("pending_review", "rejected")).toBe(true);
    expect(canModerateNewsTransition("published", "pending_review")).toBe(false);
  });
});
