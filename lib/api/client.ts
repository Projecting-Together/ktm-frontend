import type {
  Amenity,
  Listing,
  ListingFilters,
  ListingListItem,
  PaginatedResponse,
  TokenPair,
  User,
} from "./types";

export type {
  Amenity,
  Listing,
  ListingFilters,
  ListingListItem,
  ListingImage,
  ListingLocation,
  PaginatedResponse,
  TokenPair,
  User,
  UserProfile,
} from "./types";

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  meta?: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next?: boolean;
    has_prev?: boolean;
  };
}

let accessToken: string | null = null;
let refreshToken: string | null = null;

function getBackendURL() {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return "http://localhost:8000/api/v1";
}

function readStoredTokens() {
  if (typeof window === "undefined") {
    return;
  }
  accessToken = localStorage.getItem("accessToken");
  refreshToken = localStorage.getItem("refreshToken");
}

function persistTokens(tokens: TokenPair) {
  accessToken = tokens.access_token;
  refreshToken = tokens.refresh_token;
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", tokens.access_token);
    localStorage.setItem("refreshToken", tokens.refresh_token);
    document.cookie = `accessToken=${tokens.access_token}; Path=/; SameSite=Lax`;
  }
}

function persistRole(role: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("userRole", role);
    document.cookie = `userRole=${role}; Path=/; SameSite=Lax`;
  }
}

function clearTokens() {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    document.cookie = "accessToken=; Path=/; Max-Age=0; SameSite=Lax";
    document.cookie = "userRole=; Path=/; Max-Age=0; SameSite=Lax";
  }
}

/** Normalize FastAPI HTTPException detail (string | object | array) and custom handlers. */
function detailToMessage(detail: unknown): string {
  if (detail == null) return "";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((entry) => {
        if (entry && typeof entry === "object" && "msg" in entry) {
          const e = entry as { msg?: unknown; loc?: unknown };
          const loc = Array.isArray(e.loc) ? e.loc.join(".") : "";
          return loc ? `${loc}: ${String(e.msg)}` : String(e.msg);
        }
        return JSON.stringify(entry);
      })
      .filter(Boolean)
      .join("; ");
  }
  if (typeof detail === "object" && detail !== null) {
    const o = detail as Record<string, unknown>;
    if (typeof o.message === "string") return o.message;
  }
  return JSON.stringify(detail);
}

function toApiError(status: number, payload: unknown): ApiError {
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    const fromDetail = detailToMessage(obj.detail);
    const message =
      fromDetail ||
      (typeof obj.message === "string" && obj.message) ||
      (typeof obj.error === "string" && obj.error) ||
      `Request failed with status ${status}`;
    return {
      code: `HTTP_${status}`,
      message,
      details: obj,
    };
  }
  return {
    code: `HTTP_${status}`,
    message: `Request failed with status ${status}`,
  };
}

function parsePayload<T>(payload: unknown): ApiResponse<T> {
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;

    if ("data" in obj || "error" in obj) {
      return obj as ApiResponse<T>;
    }

    if ("items" in obj && "total" in obj) {
      return {
        data: obj as T,
        meta: {
          total: Number(obj.total ?? 0),
          page: Number(obj.page ?? 1),
          page_size: Number(obj.page_size ?? 20),
          total_pages: Number(obj.total_pages ?? 1),
          has_next: Boolean(obj.has_next),
          has_prev: Boolean(obj.has_prev),
        },
      };
    }

    return { data: obj as T };
  }

  if (Array.isArray(payload)) {
    return { data: payload as T };
  }

  return { data: payload as T };
}

async function apiCall<T>(endpoint: string, options: RequestInit = {}, retryOnAuth = true): Promise<ApiResponse<T>> {
  if (accessToken === null && typeof window !== "undefined") {
    readStoredTokens();
  }

  const url = `${getBackendURL()}${endpoint}`;
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  try {
    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 && retryOnAuth && refreshToken) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return apiCall<T>(endpoint, options, false);
      }
    }

    if (response.status === 204) {
      return { data: undefined as T };
    }

    const raw = await response.text();
    const payload = raw ? (JSON.parse(raw) as unknown) : undefined;

    if (!response.ok) {
      return { error: toApiError(response.status, payload) };
    }

    return parsePayload<T>(payload);
  } catch (error) {
    return {
      error: {
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Unexpected network failure",
      },
    };
  }
}

/** Build query string matching backend filters (omit empty; search only if len >= 2). */
export function buildListingQueryParams(filters: ListingFilters): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    if (key === "search" && String(value).trim().length < 2) {
      return;
    }
    params.set(key, String(value));
  });
  return params;
}

export function initializeAuth() {
  readStoredTokens();
}

export function isAuthenticated() {
  return Boolean(accessToken || (typeof window !== "undefined" && localStorage.getItem("accessToken")));
}

export async function register(email: string, password: string, role = "user") {
  return apiCall<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  });
}

export async function login(email: string, password: string) {
  const response = await apiCall<TokenPair>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (response.data) {
    persistTokens(response.data);
    const me = await getCurrentUser();
    if (me.data?.role) {
      persistRole(me.data.role);
    }
  }
  return response;
}

export async function logout() {
  if (refreshToken) {
    await apiCall("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }
  clearTokens();
}

export async function refreshAccessToken() {
  if (!refreshToken) {
    return false;
  }
  const response = await apiCall<TokenPair>(
    "/auth/refresh",
    {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    },
    false,
  );
  if (!response.data) {
    clearTokens();
    return false;
  }
  persistTokens(response.data);
  return true;
}

/** GET /listings/ — items are ListingList rows; PaginatedResponse from backend. Uses trailing slash to avoid 307 redirect. */
export async function getListings(filters: ListingFilters = {}) {
  const params = buildListingQueryParams(filters);
  const query = params.toString();
  const path = query ? `/listings/?${query}` : `/listings/`;
  return apiCall<PaginatedResponse<ListingListItem>>(path);
}

/** GET /listings/{listing_id} */
export async function getListing(listingId: string) {
  return apiCall<Listing>(`/listings/${listingId}`);
}

export async function getCurrentUser() {
  return apiCall<User>("/auth/me");
}

/** GET /amenities/ — returns Amenity[] (not wrapped in { items }). */
export async function getAmenities(skip = 0, limit = 100) {
  const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
  return apiCall<Amenity[]>(`/amenities/?${params.toString()}`);
}
