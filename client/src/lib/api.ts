/**
 * API Client for KTM Apartments Backend
 * Handles all communication with the FastAPI backend
 */

// Get backend URL from environment or use default
// For browser requests, we need to use the exposed backend URL
const getBackendURL = () => {
  // Try environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // For development, try to connect to backend on same host but different port
  // This will work if backend is exposed via a proxy
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    // Try common backend ports
    return `${protocol}//${hostname}:8000/api/v1`;
  }
  
  return 'http://localhost:8000/api/v1';
};

const API_BASE_URL = getBackendURL();

// Token management
let accessToken: string | null = localStorage.getItem('accessToken');
let refreshToken: string | null = localStorage.getItem('refreshToken');

// Response type
interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

// User types
export interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  profile?: UserProfile;
}

export interface UserProfile {
  user_id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  whatsapp?: string;
  viber?: string;
}

// Listing types
export interface Listing {
  id: string;
  owner_user_id: string;
  title: string;
  description?: string;
  listing_type?: string;
  purpose?: string;
  price?: number;
  price_period?: string;
  currency?: string;
  furnished?: boolean;
  status?: string;
  pets_allowed?: boolean;
  smoking_allowed?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  total_floors?: number;
  area_sqft?: number;
  created_at: string;
  updated_at: string;
  location?: ListingLocation;
  images?: ListingImage[];
  amenities?: Amenity[];
}

export interface ListingLocation {
  location_id: string;
  listing_id: string;
  address_line?: string;
  city?: string;
  municipality?: string;
  district?: string;
  province?: string;
  ward_no?: number;
  latitude?: number;
  longitude?: number;
}

export interface ListingImage {
  image_id: string;
  listing_id: string;
  image_url: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
}

export interface Amenity {
  id: string;
  name: string;
  amenity_type?: string;
  code?: string;
}

// Request types
export interface ListingCreateRequest {
  title: string;
  description?: string;
  listing_type?: string;
  purpose?: string;
  price?: number;
  price_period?: string;
  currency?: string;
  furnished?: boolean;
  pets_allowed?: boolean;
  smoking_allowed?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  total_floors?: number;
  area_sqft?: number;
  location?: ListingLocation;
}

export interface ListingFilters {
  skip?: number;
  limit?: number;
  listing_type?: string;
  city?: string;
  district?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  purpose?: string;
  furnished?: boolean;
  search?: string;
  sort_by?: string;
  sort_order?: string;
}

// Helper function to make API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Add authorization header if token exists
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    // Log API call for debugging
    console.log(`[API] ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 - try to refresh token
    if (response.status === 401 && refreshToken) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry the request with new token
        return apiCall<T>(endpoint, options);
      }
    }

    const data = await response.json();

    if (!response.ok) {
      console.error(`[API Error] ${response.status}:`, data);
      return {
        error: data.error || {
          code: 'API_ERROR',
          message: data.detail || 'An error occurred',
        },
      };
    }

    console.log(`[API Success] ${response.status}`);
    return data;
  } catch (error) {
    console.error('[API Network Error]:', error);
    return {
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network error occurred',
      },
    };
  }
}

// Auth endpoints
export async function register(
  email: string,
  password: string,
  role: string = 'user'
): Promise<ApiResponse<User>> {
  return apiCall<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, role }),
  });
}

export async function login(
  email: string,
  password: string
): Promise<ApiResponse<{ access_token: string; refresh_token: string; token_type: string }>> {
  const response = await apiCall<{ access_token: string; refresh_token: string; token_type: string }>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }
  );

  if (response.data) {
    accessToken = response.data.access_token;
    refreshToken = response.data.refresh_token;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  return response;
}

export async function logout(): Promise<void> {
  if (refreshToken) {
    await apiCall('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

export async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;

  const response = await apiCall<{ access_token: string; refresh_token: string }>(
    '/auth/refresh',
    {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }
  );

  if (response.data) {
    accessToken = response.data.access_token;
    refreshToken = response.data.refresh_token;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    return true;
  }

  return false;
}

export async function getCurrentUser(): Promise<ApiResponse<User>> {
  return apiCall<User>('/auth/me');
}

export async function updateProfile(profile: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
  return apiCall<UserProfile>('/auth/me/profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
  });
}

// Listings endpoints
export async function getListings(
  filters: ListingFilters = {}
): Promise<ApiResponse<{ items: Listing[]; total: number }>> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();
  const endpoint = `/listings${queryString ? `?${queryString}` : ''}`;

  return apiCall<{ items: Listing[]; total: number }>(endpoint);
}

export async function getListing(listingId: string): Promise<ApiResponse<Listing>> {
  return apiCall<Listing>(`/listings/${listingId}`);
}

export async function createListing(
  listing: ListingCreateRequest
): Promise<ApiResponse<Listing>> {
  return apiCall<Listing>('/listings', {
    method: 'POST',
    body: JSON.stringify(listing),
  });
}

export async function updateListing(
  listingId: string,
  listing: Partial<ListingCreateRequest>
): Promise<ApiResponse<Listing>> {
  return apiCall<Listing>(`/listings/${listingId}`, {
    method: 'PUT',
    body: JSON.stringify(listing),
  });
}

export async function deleteListing(listingId: string): Promise<ApiResponse<null>> {
  return apiCall<null>(`/listings/${listingId}`, {
    method: 'DELETE',
  });
}

export async function getMyListings(
  skip: number = 0,
  limit: number = 20
): Promise<ApiResponse<{ items: Listing[]; total: number }>> {
  return apiCall<{ items: Listing[]; total: number }>(
    `/listings/my-listings?skip=${skip}&limit=${limit}`
  );
}

export async function addListingImage(
  listingId: string,
  imageUrl: string,
  altText?: string,
  isPrimary: boolean = false
): Promise<ApiResponse<ListingImage>> {
  return apiCall<ListingImage>(`/listings/${listingId}/images`, {
    method: 'POST',
    body: JSON.stringify({
      image_url: imageUrl,
      alt_text: altText,
      is_primary: isPrimary,
    }),
  });
}

export async function deleteListingImage(imageId: string): Promise<ApiResponse<null>> {
  return apiCall<null>(`/listings/images/${imageId}`, {
    method: 'DELETE',
  });
}

// Amenities endpoints
export async function getAmenities(): Promise<ApiResponse<{ items: Amenity[] }>> {
  return apiCall<{ items: Amenity[] }>('/amenities');
}

// Initialize tokens from localStorage on module load
export function initializeAuth(): void {
  accessToken = localStorage.getItem('accessToken');
  refreshToken = localStorage.getItem('refreshToken');
}

// Export token getters
export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

export function isAuthenticated(): boolean {
  return !!accessToken;
}
