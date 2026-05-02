/**
 * Validates JSON fixtures (via barrel Zod parse) and full mock catalog consistency.
 * Run from repo frontend root: pnpm run validate:fixtures
 */
import {
  adminListingsCatalog,
  mockAdminAuthTokens,
  mockAmenities,
  mockLocalities,
  mswScenarioKnobs,
} from "../../src/test-utils/fixtures/index.ts";
import { assertMockCatalogIntegrity } from "../../src/test-utils/mockCatalogIntegrity.ts";

if (mockLocalities.length === 0 || mockAmenities.length === 0) {
  console.error("validate-fixtures: expected non-empty locality and amenity catalogs");
  process.exit(1);
}

assertMockCatalogIntegrity();

if (!mockAdminAuthTokens.access_token || adminListingsCatalog.length === 0) {
  console.error("validate-fixtures: MSW / admin listing fixtures failed to parse");
  process.exit(1);
}

if (!mswScenarioKnobs.messages.forbidden || mswScenarioKnobs.numericKnobs.stressBioRepeatLength < 0) {
  console.error("validate-fixtures: scenario knobs failed to parse");
  process.exit(1);
}

console.log(
  `validate-fixtures: OK (${mockLocalities.length} localities, ${mockAmenities.length} amenities, ${adminListingsCatalog.length} admin listings; scenario knobs loaded; mockData consistency verified)`,
);
