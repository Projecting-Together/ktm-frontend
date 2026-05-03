import { z } from "zod";
import type {
  AdminAnalyticsPoint,
  AdminDashboardActivity,
  AdminDashboardKpi,
  AdminListing,
  AdminTransaction,
  AdminUser,
} from "@/lib/admin/types";
import {
  LISTING_TYPE_VALUES,
  type AdminAnalyticsOverview,
  type Amenity,
  type AuditLog,
  type Favorite,
  type Inquiry,
  type Listing,
  type ListingImage,
  type Locality,
  type Report,
  type TokenPair,
  type User,
  type VisitRequest,
} from "@/lib/api/types";
import { ADMIN_DASHBOARD_KPI_KEYS, ADMIN_LISTING_STATUS_VALUES } from "@/lib/admin/types";

const localitySchema = z.object({
  id: z.string(),
  name: z.string(),
  name_ne: z.string().nullable().optional(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  description_ne: z.string().nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  meta_data: z.record(z.string(), z.unknown()).nullable().optional(),
  listing_count: z.number().optional(),
  avg_price: z.number().nullable().optional(),
  image_url: z.string().nullable().optional(),
});

const amenitySchema = z.object({
  id: z.string(),
  name: z.string(),
  amenity_type: z.enum(["building", "unit", "nearby"]).nullable().optional(),
  code: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
});

const listingsBundleSchema = z.object({
  primary: z.array(z.any()),
  rentVariants: z.array(z.any()),
});

export function parseLocalitiesCatalog(data: unknown): Locality[] {
  return z.array(localitySchema).parse(data) as Locality[];
}

export function parseAmenitiesCatalog(data: unknown): Amenity[] {
  return z.array(amenitySchema).parse(data) as Amenity[];
}

export function parseListingsBundle(data: unknown): { primary: Listing[]; rentVariants: Listing[] } {
  const o = listingsBundleSchema.parse(data);
  return {
    primary: o.primary as Listing[],
    rentVariants: o.rentVariants as Listing[],
  };
}

export function parseUsersCatalog(data: unknown): User[] {
  return z.array(z.any()).parse(data) as User[];
}

export function parseInquiriesSeed(data: unknown): Inquiry[] {
  return z.array(z.any()).parse(data) as Inquiry[];
}

export function parseVisitRequestsSeed(data: unknown): VisitRequest[] {
  return z.array(z.any()).parse(data) as VisitRequest[];
}

export function parseFavoritesSeed(data: unknown): Favorite[] {
  return z.array(z.any()).parse(data) as Favorite[];
}

export function parseAuthTokensPair(data: unknown): { renter: TokenPair; owner: TokenPair } {
  const o = z.object({ renter: z.any(), owner: z.any() }).parse(data);
  return { renter: o.renter as TokenPair, owner: o.owner as TokenPair };
}

export function parseAdminAnalyticsSnapshot(data: unknown): AdminAnalyticsOverview {
  return z.any().parse(data) as AdminAnalyticsOverview;
}

export function parseAuditLogsSnapshot(data: unknown): AuditLog[] {
  return z.array(z.any()).parse(data) as AuditLog[];
}

export function parseReportsSnapshot(data: unknown): Report[] {
  return z.array(z.any()).parse(data) as Report[];
}

export function parseListingImagesFlat(data: unknown): Array<ListingImage & { listing_id: string }> {
  return z.array(z.any()).parse(data) as Array<ListingImage & { listing_id: string }>;
}

const adminListingSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(LISTING_TYPE_VALUES),
  status: z.enum(ADMIN_LISTING_STATUS_VALUES),
  city: z.string(),
  priceNpr: z.number(),
  createdAt: z.string(),
});

export function parseAdminListingsCatalog(data: unknown): AdminListing[] {
  return z.array(adminListingSchema).parse(data) as AdminListing[];
}

const adminUserUiSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.enum(["user", "admin"]),
  status: z.enum(["active", "inactive", "suspended"]),
  joinedAt: z.string(),
});

const adminTransactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  listingId: z.string(),
  amountNpr: z.number(),
  status: z.enum(["paid", "pending", "failed", "refunded"]),
  paymentMethod: z.enum(["wallet", "bank_transfer", "cash"]),
  createdAt: z.string(),
});

const adminAnalyticsPointSchema = z.object({
  date: z.string(),
  listings: z.number(),
  transactions: z.number(),
  users: z.number(),
});

const adminDashboardKpiSchema = z.object({
  key: z.enum(ADMIN_DASHBOARD_KPI_KEYS),
  label: z.string(),
  value: z.number(),
  deltaPercent: z.number(),
});

const adminDashboardActivitySchema = z.object({
  id: z.string(),
  actor: z.string(),
  action: z.string(),
  createdAt: z.string(),
});

const adminDashboardFacadeSchema = z.object({
  kpis: z.array(adminDashboardKpiSchema),
  activities: z.array(adminDashboardActivitySchema),
});

/** Admin UI user table (`/admin/users` facade), not `catalog/users.json` API users. */
export function parseAdminUsersUiCatalog(data: unknown): AdminUser[] {
  return z.array(adminUserUiSchema).parse(data) as AdminUser[];
}

export function parseAdminTransactionsCatalog(data: unknown): AdminTransaction[] {
  return z.array(adminTransactionSchema).parse(data) as AdminTransaction[];
}

export function parseAdminAnalyticsSeriesCatalog(data: unknown): AdminAnalyticsPoint[] {
  return z.array(adminAnalyticsPointSchema).parse(data) as AdminAnalyticsPoint[];
}

export function parseAdminDashboardFacade(data: unknown): {
  kpis: AdminDashboardKpi[];
  activities: AdminDashboardActivity[];
} {
  const o = adminDashboardFacadeSchema.parse(data);
  return {
    kpis: o.kpis as AdminDashboardKpi[],
    activities: o.activities as AdminDashboardActivity[],
  };
}

/** MSW news CMS rows — aligned with `frontend/src/msw/newsMockStore.ts`. */
const newsContentStatusSchema = z.enum(["draft", "pending_review", "published", "rejected"]);

const newsMswArticleRowSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  content: z.string().nullable(),
  cover_image_url: z.string().nullable(),
  status: newsContentStatusSchema,
  author_user_id: z.string(),
  rejection_reason: z.string().nullable(),
  published_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

const newsMswCatalogSchema = z
  .object({
    workspace_article_id: z.string(),
    workspace_publish_slug: z.string(),
    published: z.array(newsMswArticleRowSchema),
    workspace_initial: newsMswArticleRowSchema,
  })
  .superRefine((val, ctx) => {
    if (val.workspace_initial.id !== val.workspace_article_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `workspace_initial.id (${val.workspace_initial.id}) must equal workspace_article_id (${val.workspace_article_id})`,
      });
    }
  });

export type NewsMswArticleRow = z.infer<typeof newsMswArticleRowSchema>;
export type NewsMswCatalog = z.infer<typeof newsMswCatalogSchema>;

export function parseNewsMswCatalog(data: unknown): NewsMswCatalog {
  return newsMswCatalogSchema.parse(data);
}
