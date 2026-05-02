import type { ListingImage, User, UserProfile } from "@/lib/api/types";
import adminAnalyticsSeriesJson from "./catalog/admin-analytics-series.json";
import adminDashboardJson from "./catalog/admin-dashboard.json";
import adminListingsJson from "./catalog/admin-listings.json";
import adminAnalyticsJson from "./catalog/admin-analytics.json";
import adminTransactionsJson from "./catalog/admin-transactions.json";
import adminUsersUiJson from "./catalog/admin-users-ui.json";
import amenitiesJson from "./catalog/amenities.json";
import auditLogsJson from "./catalog/audit-logs.json";
import authTokensJson from "./catalog/auth-tokens.json";
import favoritesJson from "./catalog/favorites.json";
import inquiriesJson from "./catalog/inquiries.json";
import listingImagesJson from "./catalog/listing-images.json";
import listingsJson from "./catalog/listings.json";
import localitiesJson from "./catalog/localities.json";
import reportsJson from "./catalog/reports.json";
import newsMswJson from "./catalog/news-msw.json";
import usersJson from "./catalog/users.json";
import visitRequestsJson from "./catalog/visit-requests.json";
import adminAuthTokensMswJson from "./msw/admin-auth-tokens.json";
import agentAuthTokensMswJson from "./msw/agent-auth-tokens.json";
import authLoginsMswJson from "./msw/auth-logins.json";
import syntheticIdsMswJson from "./msw/synthetic-ids.json";
import uploadTemplatesMswJson from "./msw/upload-templates.json";
import mswScenariosJson from "./scenarios/msw-scenarios.json";
import {
  parseAdminAnalyticsSeriesCatalog,
  parseAdminAnalyticsSnapshot,
  parseAdminDashboardFacade,
  parseAdminListingsCatalog,
  parseAdminTransactionsCatalog,
  parseAdminUsersUiCatalog,
  parseAmenitiesCatalog,
  parseAuditLogsSnapshot,
  parseAuthTokensPair,
  parseFavoritesSeed,
  parseInquiriesSeed,
  parseListingImagesFlat,
  parseListingsBundle,
  parseLocalitiesCatalog,
  parseNewsMswCatalog,
  parseReportsSnapshot,
  parseUsersCatalog,
  parseVisitRequestsSeed,
} from "./parseFixtures";
import {
  parseAdminAuthTokensFromMsw,
  parseMswAuthLogins,
  parseMswSyntheticIds,
  parseMswUploadTemplates,
} from "./parseMswFixtures";
import { parseMswScenarioKnobs } from "./parseScenarioFixtures";

/** Validated catalog rows from JSON (single source for localities in mocks). */
export const mockLocalities = parseLocalitiesCatalog(localitiesJson);

/** Validated catalog rows from JSON (single source for amenities in mocks). */
export const mockAmenities = parseAmenitiesCatalog(amenitiesJson);

const listingsBundle = parseListingsBundle(listingsJson);

/** Primary listing rows (search/detail MSW + tests). */
export const mockListings = listingsBundle.primary;

/** Rent-detail fixture variants (remapped ids; not mixed into primary search sets). */
export const mockRentListingVariants = listingsBundle.rentVariants;

/** Flattened images with `listing_id` for audits / optional integrity tooling. */
export const catalogListingImagesFlat = parseListingImagesFlat(listingImagesJson);

const users = parseUsersCatalog(usersJson);

function userById(id: string): User {
  const found = users.find((u) => u.id === id);
  if (!found) {
    throw new Error(`mock users.json missing user id "${id}"`);
  }
  return found;
}

export const mockRenter = userById("usr-renter-001");
export const mockOwner = userById("usr-owner-001");
export const mockAgent = userById("usr-agent-001");
export const mockAdmin = userById("usr-admin-001");

export const mockRenterProfile = mockRenter.profile as UserProfile;
export const mockOwnerProfile = mockOwner.profile as UserProfile;
export const mockAgentProfile = mockAgent.profile as UserProfile;

const authPair = parseAuthTokensPair(authTokensJson);

export const mockAuthTokens = authPair.renter;
export const mockOwnerAuthTokens = authPair.owner;

export const mockAdminAnalytics = parseAdminAnalyticsSnapshot(adminAnalyticsJson);
export const mockAuditLogs = parseAuditLogsSnapshot(auditLogsJson);
export const mockReports = parseReportsSnapshot(reportsJson);

/** Admin facade table (MSW `/api/v1/admin/listings`). */
export const adminListingsCatalog = parseAdminListingsCatalog(adminListingsJson);

/** Admin UI user rows (facade types), distinct from `catalog/users.json` API `User` catalog. */
export const adminUiUsersCatalog = parseAdminUsersUiCatalog(adminUsersUiJson);

export const adminTransactionsCatalog = parseAdminTransactionsCatalog(adminTransactionsJson);

/** Time-series points for admin charts (`lib/admin/service` mock path). */
export const adminAnalyticsSeriesCatalog = parseAdminAnalyticsSeriesCatalog(adminAnalyticsSeriesJson);

const adminDashboardFacade = parseAdminDashboardFacade(adminDashboardJson);

export const adminDashboardKpisCatalog = adminDashboardFacade.kpis;

export const adminDashboardActivitiesCatalog = adminDashboardFacade.activities;

/** MSW-only admin JWT pair (not in auth-tokens.json renter/owner bundle). */
export const mockAdminAuthTokens = parseAdminAuthTokensFromMsw(adminAuthTokensMswJson);

/** MSW-only agent JWT pair (aligned with `usr-agent-001` in catalog/users.json). */
export const mockAgentAuthTokens = parseAdminAuthTokensFromMsw(agentAuthTokensMswJson);

/** MSW news CMS seed (`catalog/news-msw.json`) — consumed by `src/msw/newsMockStore.ts`. */
export const newsMswCatalog = parseNewsMswCatalog(newsMswJson);

export const mswSyntheticIds = parseMswSyntheticIds(syntheticIdsMswJson);

export const mswUploadTemplates = parseMswUploadTemplates(uploadTemplatesMswJson);

export const mswAuthLogins = parseMswAuthLogins(authLoginsMswJson);

/** MSW scenario matrix strings and numeric knobs (`mockScenarioData`). */
export const mswScenarioKnobs = parseMswScenarioKnobs(mswScenariosJson);

/** Raw inquiry rows from JSON; `mockData` re-attaches `listing` + `sender`. */
export const inquiriesSeed = parseInquiriesSeed(inquiriesJson);

/** Raw visit rows from JSON. */
export const visitRequestsSeed = parseVisitRequestsSeed(visitRequestsJson);

/** Raw favorites from JSON. */
export const favoritesSeed = parseFavoritesSeed(favoritesJson);

export type CatalogListingImageRow = ListingImage & { listing_id: string };

export type { NewsMswArticleRow, NewsMswCatalog } from "./parseFixtures";
