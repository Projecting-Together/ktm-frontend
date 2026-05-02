import type { AdminListing } from "@/lib/admin/types";
import { adminListingsCatalog } from "@/test-utils/fixtures";

// Keep admin facade fixtures deterministic for service tests (rows from fixtures JSON).
export const adminListings: AdminListing[] = adminListingsCatalog;
