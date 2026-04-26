import {
  mockAdminAnalytics,
  mockInquiries,
  mockListingItems,
  mockListingsPage1,
  mockRenter,
} from "@/test-utils/mockData";

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
      listingsBody: { detail: "Internal server error" },
    },
    partial: {
      listings: {
        ...mockListingsPage1,
        items: mockListingItems.slice(0, 2),
        total: 2,
      },
    },
    permission: {
      listingsStatus: 403,
      listingsBody: { detail: "Forbidden" },
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
      meBody: { detail: "Not authenticated" },
    },
    error: {
      meStatus: 500,
      meBody: { detail: "Auth service unavailable" },
    },
    partial: {
      meStatus: 200,
      meBody: {
        id: mockRenter.id,
      },
    },
    permission: {
      meStatus: 403,
      meBody: { detail: "Forbidden" },
    },
    stress: {
      meStatus: 200,
      meBody: {
        ...mockRenter,
        profile: mockRenter.profile
          ? {
              ...mockRenter.profile,
              bio: `${mockRenter.profile.bio ?? ""} ${"x".repeat(700)}`.trim(),
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
      analyticsBody: { detail: "Admin analytics unavailable" },
    },
    partial: {
      analytics: {
        ...mockAdminAnalytics,
        top_neighborhoods: [],
      },
      inquiries: mockInquiries.slice(0, 1),
    },
    permission: {
      analyticsStatus: 403,
      analyticsBody: { detail: "Forbidden" },
    },
    stress: {
      analytics: {
        ...mockAdminAnalytics,
        total_views: 9_999_999,
      },
      inquiries: mockInquiries.map((inquiry) => ({
        ...inquiry,
        message: `${inquiry.message} ${inquiry.message}`.trim(),
      })),
    },
  },
};
