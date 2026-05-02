/**
 * Mock-backend analytics timeseries: filter + scale fixture series by query params.
 * Mirrors what FastAPI should compute from warehouse data — kept out of `lib/admin/service.ts`.
 */
import type { AdminAnalyticsPoint } from "@/lib/admin/types";
import { adminAnalyticsSeriesCatalog } from "@/test-utils/fixtures";

export interface AdminAnalyticsTimeseriesParams {
  dateRange?: "last-7-days" | "last-30-days" | "last-90-days";
  city?: string;
  listingType?: string;
  from?: string;
  to?: string;
}

function toDateOnlyIso(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function subtractDaysIso(dateIso: string, days: number): string {
  const anchor = new Date(`${dateIso}T00:00:00.000Z`);
  anchor.setUTCDate(anchor.getUTCDate() - days);
  return toDateOnlyIso(anchor);
}

export function buildAdminAnalyticsTimeseries(params: AdminAnalyticsTimeseriesParams = {}): AdminAnalyticsPoint[] {
  const series = adminAnalyticsSeriesCatalog;
  const latestSeriesDate = series.reduce((latest, point) => (point.date > latest ? point.date : latest), "1970-01-01");
  const rangeDays: Record<NonNullable<AdminAnalyticsTimeseriesParams["dateRange"]>, number> = {
    "last-7-days": 7,
    "last-30-days": 30,
    "last-90-days": 90,
  };
  const effectiveTo = params.to ?? (params.dateRange ? latestSeriesDate : undefined);
  const effectiveFrom =
    params.from ??
    (params.dateRange && effectiveTo ? subtractDaysIso(effectiveTo, rangeDays[params.dateRange] - 1) : undefined);
  const cityFactor =
    params.city && params.city !== "all-cities"
      ? params.city === "kathmandu"
        ? 1
        : params.city === "lalitpur"
          ? 0.7
          : 0.5
      : 1;
  const listingTypeFactor =
    params.listingType && params.listingType !== "all-types"
      ? params.listingType === "apartment"
        ? 1
        : params.listingType === "house"
          ? 0.85
          : params.listingType === "room"
            ? 0.65
            : 0.55
      : 1;
  const scaleFactor = cityFactor * listingTypeFactor;

  return series
    .filter((item) => {
      if (effectiveFrom && item.date < effectiveFrom) {
        return false;
      }

      if (effectiveTo && item.date > effectiveTo) {
        return false;
      }

      return true;
    })
    .map((item) => ({
      ...item,
      listings: Math.max(0, Math.round(item.listings * scaleFactor)),
      transactions: Math.max(0, Math.round(item.transactions * scaleFactor)),
      users: Math.max(0, Math.round(item.users * scaleFactor)),
    }));
}
