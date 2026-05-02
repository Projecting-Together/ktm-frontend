import { mockAmenities, mockLocalities } from "@/test-utils/fixtures";

describe("fixture catalog (JSON + Zod)", () => {
  it("loads localities with stable ordering and slugs", () => {
    expect(mockLocalities).toHaveLength(5);
    expect(mockLocalities[0]?.slug).toBe("thamel");
    expect(mockLocalities.map((l) => l.id)).toEqual([
      "nbh-001",
      "nbh-002",
      "nbh-003",
      "nbh-004",
      "nbh-005",
    ]);
  });

  it("loads amenities", () => {
    expect(mockAmenities.length).toBe(8);
    expect(mockAmenities[0]?.code).toBe("wifi");
  });
});
