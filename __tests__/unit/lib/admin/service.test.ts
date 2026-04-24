import { describe, expect, it } from "@jest/globals";
import { adminService } from "@/lib/admin/service";

describe("admin service facade", () => {
  it("filters listings by status and query", async () => {
    const response = await adminService.getListings({
      status: "active",
      query: "patan",
      page: 1,
      pageSize: 10,
    });

    expect(response.total).toBe(1);
    expect(response.page).toBe(1);
    expect(response.pageSize).toBe(10);
    expect(response.totalPages).toBe(1);
    expect(response.items).toHaveLength(1);
    expect(response.items[0]).toMatchObject({
      id: "l2",
      status: "active",
      title: "Patan Commercial Space",
    });
  });

  it("updates transaction status", async () => {
    const updated = await adminService.updateTransactionStatus("t2", "failed");
    const response = await adminService.getTransactions({ status: "failed" });

    expect(updated).not.toBeNull();
    expect(updated?.id).toBe("t2");
    expect(updated?.status).toBe("failed");
    expect(response.items.some((item) => item.id === "t2" && item.status === "failed")).toBe(true);
  });

  it("returns totalPages=0 for empty listing results", async () => {
    const response = await adminService.getListings({
      status: "sold",
      query: "does-not-exist",
      page: 1,
      pageSize: 10,
    });

    expect(response.total).toBe(0);
    expect(response.items).toHaveLength(0);
    expect(response.totalPages).toBe(0);
  });

  it("prevents updateUser from changing id", async () => {
    const updated = await adminService.updateUser("u1", {
      email: "admin+updated@test.com",
      // Intentionally bypassing compile-time type restriction to verify runtime behavior.
      ...( { id: "u999" } as unknown as never ),
    });

    expect(updated).not.toBeNull();
    expect(updated?.id).toBe("u1");
    expect(updated?.email).toBe("admin+updated@test.com");
  });

  it("does not mutate underlying store when returned item is mutated", async () => {
    const firstRead = await adminService.getListings({ query: "sunrise", page: 1, pageSize: 5 });
    expect(firstRead.items).toHaveLength(1);

    firstRead.items[0].title = "Tampered Title";

    const secondRead = await adminService.getListings({ query: "sunrise", page: 1, pageSize: 5 });
    expect(secondRead.items[0].title).toBe("Sunrise Residency Apartment");
  });

  it("applies dateRange relative to latest analytics series date", async () => {
    const analytics = await adminService.getAnalytics({ dateRange: "last-7-days" });

    expect(analytics).toHaveLength(5);
    expect(analytics[0].date).toBe("2026-04-20");
    expect(analytics[analytics.length - 1].date).toBe("2026-04-24");
  });
});
