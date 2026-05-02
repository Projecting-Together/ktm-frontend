/**
 * One-shot exporter: writes `src/test-utils/fixtures/catalog/*.json` from current mockData.
 * Run: pnpm exec tsx tooling/scripts/export-mock-catalog-to-json.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const catalogDir = path.resolve(__dirname, "../../src/test-utils/fixtures/catalog");

async function main() {
  const m = await import("../../src/test-utils/mockData.ts");

  mkdirSync(catalogDir, { recursive: true });

  const write = (name: string, data: unknown) => {
    writeFileSync(path.join(catalogDir, name), `${JSON.stringify(data, null, 2)}\n`, "utf8");
  };

  write("listings.json", {
    primary: m.mockListings,
    rentVariants: m.mockRentListingVariants,
  });

  const allListings = [...m.mockListings, ...m.mockRentListingVariants];
  const flatImages = allListings.flatMap((listing) =>
    listing.images.map((img) => ({ ...img, listing_id: listing.id })),
  );
  write("listing-images.json", flatImages);

  write("users.json", [m.mockRenter, m.mockOwner, m.mockAgent, m.mockAdmin]);

  write("inquiries.json", m.mockInquiries);
  write("visit-requests.json", m.mockVisitRequests);
  write("favorites.json", m.mockFavorites);

  write("auth-tokens.json", {
    renter: m.mockAuthTokens,
    owner: m.mockOwnerAuthTokens,
  });

  write("admin-analytics.json", m.mockAdminAnalytics);
  write("audit-logs.json", m.mockAuditLogs);
  write("reports.json", m.mockReports);

  console.log(`Wrote catalog JSON files under ${catalogDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
