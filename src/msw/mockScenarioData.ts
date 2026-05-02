import {
  mockAdminAnalytics,
  mockInquiries,
  mockListingItems,
  mockListingsPage1,
  mockRenter,
} from "@/test-utils/mockData";
import { mswScenarioKnobs } from "@/test-utils/fixtures";

const SC = mswScenarioKnobs.messages;
const NK = mswScenarioKnobs.numericKnobs;

export type ScenarioState = "happy" | "empty" | "error" | "partial" | "permission" | "stress";

type ScenarioMatrix<T> = Record<ScenarioState, T>;

type PublicScenario = {
  listings?: typeof mockListingsPage1;
  listingsStatus?: number;
  listingsBody?: { detail: string };
};

type AuthScenario = {
  meStatus: number;
  meBody?: unknown;
};

type AdminScenario = {
  analytics?: typeof mockAdminAnalytics;
  inquiries?: typeof mockInquiries;
  analyticsStatus?: number;
  analyticsBody?: { detail: string };
};

const partialListingItems = mockListingItems.slice(0, NK.partialListingSliceEnd);

export const scenarioCatalog: {
  public: ScenarioMatrix<PublicScenario>;
  auth: ScenarioMatrix<AuthScenario>;
  admin: ScenarioMatrix<AdminScenario>;
} = {
  public: {
    happy: {
      listings: mockListingsPage1,
    },
    empty: {
      listings: {
        ...mockListingsPage1,
        items: [],
        total: 0,
        has_next: false,
        has_prev: false,
      },
    },
    error: {
      listingsStatus: 500,
      listingsBody: { detail: SC.internalServerError },
    },
    partial: {
      listings: {
        ...mockListingsPage1,
        items: partialListingItems,
        total: partialListingItems.length,
      },
    },
    permission: {
      listingsStatus: 403,
      listingsBody: { detail: SC.forbidden },
    },
    stress: {
      listings: {
        ...mockListingsPage1,
        items: mockListingItems.map((item) => ({
          ...item,
          title: `${item.title} ${item.title}`.trim(),
        })),
      },
    },
  },
  auth: {
    happy: {
      meStatus: 200,
      meBody: mockRenter,
    },
    empty: {
      meStatus: 401,
      meBody: { detail: SC.notAuthenticated },
    },
    error: {
      meStatus: 500,
      meBody: { detail: SC.authUnavailable },
    },
    partial: {
      meStatus: 200,
      meBody: {
        id: mockRenter.id,
      },
    },
    permission: {
      meStatus: 403,
      meBody: { detail: SC.forbidden },
    },
    stress: {
      meStatus: 200,
      meBody: {
        ...mockRenter,
        profile: mockRenter.profile
          ? {
              ...mockRenter.profile,
              bio: `${mockRenter.profile.bio ?? ""} ${"x".repeat(NK.stressBioRepeatLength)}`.trim(),
            }
          : mockRenter.profile,
      },
    },
  },
  admin: {
    happy: {
      analytics: mockAdminAnalytics,
      inquiries: mockInquiries,
    },
    empty: {
      analytics: {
        ...mockAdminAnalytics,
        total_listings: 0,
        active_listings: 0,
        total_inquiries: 0,
      },
      inquiries: [],
    },
    error: {
      analyticsStatus: 500,
      analyticsBody: { detail: SC.adminAnalyticsUnavailable },
    },
    partial: {
      analytics: {
        ...mockAdminAnalytics,
        top_localities: [],
      },
      inquiries: mockInquiries.slice(0, 1),
    },
    permission: {
      analyticsStatus: 403,
      analyticsBody: { detail: SC.forbidden },
    },
    stress: {
      analytics: {
        ...mockAdminAnalytics,
        total_views: NK.stressAnalyticsTotalViews,
      },
      inquiries: mockInquiries.map((inquiry) => ({
        ...inquiry,
        message: `${inquiry.message} ${inquiry.message}`.trim(),
      })),
    },
  },
};
