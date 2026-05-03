import {
  mapLegacyManageNextPath,
  resolvePostLoginRedirect,
} from "@/lib/constants/memberDashboardRoutes";

describe("memberDashboardRoutes", () => {
  it("maps legacy manage paths to dashboard equivalents", () => {
    expect(mapLegacyManageNextPath("/manage")).toBe("/dashboard");
    expect(mapLegacyManageNextPath("/manage/listings")).toBe("/dashboard/listings");
    expect(mapLegacyManageNextPath("/manage/listings/new")).toBe("/dashboard/listings/new");
    expect(mapLegacyManageNextPath("/manage/listings/abc/edit")).toBe("/dashboard/listings/abc/edit");
    expect(mapLegacyManageNextPath("/manage/inquiries")).toBe("/dashboard/leads/inquiries");
    expect(mapLegacyManageNextPath("/manage/visits")).toBe("/dashboard/leads/visits");
    expect(mapLegacyManageNextPath("/manage/news")).toBe("/dashboard/news");
    expect(mapLegacyManageNextPath("/manage/analytics")).toBe("/dashboard/analytics");
  });

  it("preserves query strings when mapping", () => {
    expect(mapLegacyManageNextPath("/manage/listings?status=archived")).toBe("/dashboard/listings?status=archived");
  });

  it("leaves non-manage paths unchanged", () => {
    expect(mapLegacyManageNextPath("/dashboard/inquiries")).toBe("/dashboard/inquiries");
    expect(mapLegacyManageNextPath("/listings")).toBe("/listings");
  });

  it("resolvePostLoginRedirect defaults to /dashboard", () => {
    expect(resolvePostLoginRedirect(null)).toBe("/dashboard");
    expect(resolvePostLoginRedirect("")).toBe("/dashboard");
  });
});
