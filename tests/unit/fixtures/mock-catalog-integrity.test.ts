import { assertMockCatalogIntegrity } from "@/test-utils/mockCatalogIntegrity";

describe("mock catalog integrity", () => {
  it("satisfies locality, amenity, image, and derived-view consistency", () => {
    expect(() => assertMockCatalogIntegrity()).not.toThrow();
  });
});
