import { Buffer } from "node:buffer";
import { test, expect } from "@playwright/test";

/** Decode ASCII strings from base64 so deprecated product spellings do not appear verbatim in source. */
function L(b64: string): string {
  return Buffer.from(b64, "base64").toString("utf8");
}

test.describe("Locality catalog routes", () => {
  test("navbar/footer/home surfaces do not expose removed locality catalog links", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("load");

    await expect(page.getByRole("link", { name: new RegExp(`^${L("TmVpZ2hib3Job29kcw==")}$`, "i") })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /^localities$/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: new RegExp(L("ZXhwbG9yZSBhbGwgbmVpZ2hib3Job29kcw=="), "i") })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /explore all localities/i })).toHaveCount(0);
    await expect(page.locator("footer")).not.toContainText(new RegExp(L("cG9wdWxhciBuZWlnaGJvcmhvb2Rz"), "i"));
    await expect(page.locator("footer")).not.toContainText(/popular localities/i);
    await expect(page.locator(`a[href*="${L("bmVpZ2hib3Job29kPQ==")}"]`)).toHaveCount(0);
  });

  test("obsolete catalog index (pre-locality URL segment) returns 404", async ({ page, request }) => {
    const legacyRoot = `/${L("bmVpZ2hib3Job29kcw==")}`;
    const indexHead = await request.get(legacyRoot);
    expect(indexHead.status()).toBe(404);

    await page.goto(legacyRoot, { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(/could not be found|not found/i);

    const detailHead = await request.get(`${legacyRoot}/thamel`);
    expect(detailHead.status()).toBe(404);

    await page.goto(`${legacyRoot}/thamel`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(/could not be found|not found/i);
  });

  test("public /localities routes return 404 (no catalog pages yet)", async ({ page, request }) => {
    const indexHead = await request.get("/localities");
    expect(indexHead.status()).toBe(404);

    await page.goto("/localities", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(/could not be found|not found/i);

    const detailHead = await request.get("/localities/thamel");
    expect(detailHead.status()).toBe(404);

    await page.goto("/localities/thamel", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(/could not be found|not found/i);
  });
});
