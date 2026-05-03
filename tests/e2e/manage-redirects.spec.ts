import { test, expect } from "@playwright/test";

/**
 * Legacy /manage → /dashboard redirect assertions.
 * Next.js `permanent: true` redirects use HTTP 308 (see `frontend/next.config.ts`).
 */

test.describe("Legacy /manage → /dashboard redirects", () => {
  test("GET /manage returns 308 Location /dashboard", async ({ request, baseURL }) => {
    const res = await request.get(`${baseURL}/manage`, { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers()["location"] ?? res.headers()["Location"]).toMatch(/\/dashboard\/?$/);
  });

  test("GET /manage/listings follows to /dashboard/listings", async ({ request, baseURL }) => {
    const res = await request.get(`${baseURL}/manage/listings`, { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    const loc = res.headers()["location"] ?? res.headers()["Location"] ?? "";
    expect(loc).toContain("dashboard/listings");
  });

  test("GET /manage/inquiries maps to lead inbox", async ({ request, baseURL }) => {
    const res = await request.get(`${baseURL}/manage/inquiries`, { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    const loc = res.headers()["location"] ?? res.headers()["Location"] ?? "";
    expect(loc).toContain("dashboard/leads/inquiries");
  });

  test("GET unlisted /manage/legacy-path redirects to member hub", async ({ request, baseURL }) => {
    const res = await request.get(`${baseURL}/manage/legacy-unknown-segment`, { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    const loc = res.headers()["location"] ?? res.headers()["Location"] ?? "";
    expect(loc).toMatch(/\/dashboard\/?$/);
  });
});
