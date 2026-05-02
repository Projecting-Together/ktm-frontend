import {
  adminListingsCatalog,
  mockAdminAuthTokens,
  mswAuthLogins,
  mswSyntheticIds,
  mswUploadTemplates,
} from "@/test-utils/fixtures";

describe("MSW fixtures (JSON + Zod)", () => {
  it("parses admin auth tokens", () => {
    expect(mockAdminAuthTokens.token_type).toBe("bearer");
    expect(mockAdminAuthTokens.access_token.length).toBeGreaterThan(20);
    expect(mockAdminAuthTokens.access_token.startsWith("eyJ")).toBe(true);
  });

  it("parses synthetic ids", () => {
    expect(mswSyntheticIds.newListingId).toBe("lst-new-001");
    expect(mswSyntheticIds.favoriteDefaultUserId).toBe("usr-renter-001");
  });

  it("parses upload templates with placeholders", () => {
    expect(mswUploadTemplates.uploadUrlTemplate).toContain("{filename}");
  });

  it("parses login accounts", () => {
    expect(mswAuthLogins.loginAccounts).toHaveLength(4);
    expect(mswAuthLogins.registerConflictEmail).toBe("existing@gmail.com");
  });

  it("parses admin listings catalog", () => {
    expect(adminListingsCatalog).toHaveLength(3);
    expect(adminListingsCatalog[0]?.id).toBe("l1");
  });
});
