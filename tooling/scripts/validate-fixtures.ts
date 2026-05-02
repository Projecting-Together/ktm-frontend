/**
 * Validates JSON fixtures (via barrel Zod parse) and full mock catalog consistency.
 * Run from repo frontend root: pnpm run validate:fixtures
 */
import {
  adminAnalyticsSeriesCatalog,
  adminDashboardActivitiesCatalog,
  adminDashboardKpisCatalog,
  adminListingsCatalog,
  adminTransactionsCatalog,
  adminUiUsersCatalog,
  mockAdminAuthTokens,
  mockAmenities,
  mockLocalities,
  mswScenarioKnobs,
  newsMswCatalog,
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

if (
  adminUiUsersCatalog.length === 0 ||
  adminTransactionsCatalog.length === 0 ||
  adminAnalyticsSeriesCatalog.length === 0 ||
  adminDashboardKpisCatalog.length === 0 ||
  adminDashboardActivitiesCatalog.length === 0
) {
  console.error("validate-fixtures: admin UI facade catalogs failed to parse or are empty");
  process.exit(1);
}

if (!mswScenarioKnobs.messages.forbidden || mswScenarioKnobs.numericKnobs.stressBioRepeatLength < 0) {
  console.error("validate-fixtures: scenario knobs failed to parse");
  process.exit(1);
}

if (
  !newsMswCatalog.workspace_article_id ||
  newsMswCatalog.published.length === 0 ||
  newsMswCatalog.workspace_initial.id !== newsMswCatalog.workspace_article_id
) {
  console.error("validate-fixtures: news-msw catalog failed to parse or inconsistent");
  process.exit(1);
}

console.log(
  `validate-fixtures: OK (${mockLocalities.length} localities, ${mockAmenities.length} amenities, ${adminListingsCatalog.length} admin listings, ${adminUiUsersCatalog.length} admin UI users, ${adminTransactionsCatalog.length} admin transactions; ${newsMswCatalog.published.length} news MSW rows; scenario knobs loaded; mockData consistency verified)`,
);
