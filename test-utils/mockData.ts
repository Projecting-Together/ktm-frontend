/**
 * KTM Apartments — Central Mock Data Factory
 *
 * Simulates the full PostgreSQL database with realistic Nepali property data.
 * Used by unit tests, integration tests, and E2E tests alike.
 * Every entity mirrors the production DB schema exactly.
 */
import type {
  User,
  UserProfile,
  Listing,
  ListingImage,
  ListingListItem,
  ListingLocation,
  Neighborhood,
  Amenity,
  Inquiry,
  VisitRequest,
  Favorite,
  PaginatedResponse,
  AdminAnalyticsOverview,
  AuditLog,
  Report,
} from "@/lib/api/types";

// ─────────────────────────────────────────────────────────────────────────────
// NEIGHBORHOODS  (10 Kathmandu neighborhoods)
// ─────────────────────────────────────────────────────────────────────────────
export const mockNeighborhoods: Neighborhood[] = [
  {
    id: "nbh-001",
    name: "Thamel",
    name_ne: "थमेल",
    slug: "thamel",
    description: "Kathmandu\'s vibrant tourist hub, popular with expats and young professionals.",
    lat: 27.7152,
    lng: 85.3123,
    listing_count: 142,
    avg_price: 32000,
    image_url: "https://images.ktmapartments.com/neighborhoods/thamel.jpg",
  },
  {
    id: "nbh-002",
    name: "Lazimpat",
    name_ne: "लाजिम्पाट",
    slug: "lazimpat",
    description: "Upscale diplomatic zone with embassies, restaurants, and premium apartments.",
    lat: 27.7176,
    lng: 85.3183,
    listing_count: 87,
    avg_price: 55000,
    image_url: "https://images.ktmapartments.com/neighborhoods/lazimpat.jpg",
  },
  {
    id: "nbh-003",
    name: "Patan",
    name_ne: "पाटन",
    slug: "patan",
    description: "Historic city of fine arts and crafts, peaceful residential areas.",
    lat: 27.6766,
    lng: 85.3240,
    listing_count: 93,
    avg_price: 22000,
    image_url: "https://images.ktmapartments.com/neighborhoods/patan.jpg",
  },
  {
    id: "nbh-004",
    name: "Koteshwor",
    name_ne: "कोटेश्वर",
    slug: "koteshwor",
    description: "Fast-growing eastern suburb with modern apartments and good transport links.",
    lat: 27.6871,
    lng: 85.3560,
    listing_count: 118,
    avg_price: 18000,
    image_url: "https://images.ktmapartments.com/neighborhoods/koteshwor.jpg",
  },
  {
    id: "nbh-005",
    name: "Bhaktapur",
    name_ne: "भक्तपुर",
    slug: "bhaktapur",
    description: "Ancient Newari city, UNESCO heritage site, affordable and culturally rich.",
    lat: 27.6710,
    lng: 85.4298,
    listing_count: 54,
    avg_price: 14000,
    image_url: "https://images.ktmapartments.com/neighborhoods/bhaktapur.jpg",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// AMENITIES
// ─────────────────────────────────────────────────────────────────────────────
export const mockAmenities: Amenity[] = [
  { id: "am-001", name: "WiFi", amenity_type: "unit", code: "wifi", icon: "wifi" },
  { id: "am-002", name: "Backup Power", amenity_type: "building", code: "backup_power", icon: "zap" },
  { id: "am-003", name: "Water Tank", amenity_type: "building", code: "water_tank", icon: "droplets" },
  { id: "am-004", name: "Security Guard", amenity_type: "building", code: "security_guard", icon: "shield" },
  { id: "am-005", name: "Parking", amenity_type: "building", code: "parking", icon: "car" },
  { id: "am-006", name: "CCTV", amenity_type: "building", code: "cctv", icon: "camera" },
  { id: "am-007", name: "Gym", amenity_type: "building", code: "gym", icon: "dumbbell" },
  { id: "am-008", name: "Lift", amenity_type: "building", code: "lift", icon: "arrow-up" },
];

// ─────────────────────────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────────────────────────
export const mockRenterProfile: UserProfile = {
  user_id: "usr-renter-001",
  first_name: "Ram",
  last_name: "Sharma",
  phone: "9841234567",
  avatar_url: "https://images.ktmapartments.com/avatars/ram-sharma.jpg",
  bio: "Software engineer looking for a quiet apartment near Thamel.",
  whatsapp: "9841234567",
};

export const mockOwnerProfile: UserProfile = {
  user_id: "usr-owner-001",
  first_name: "Sita",
  last_name: "Thapa",
  phone: "9851234567",
  avatar_url: "https://images.ktmapartments.com/avatars/sita-thapa.jpg",
  bio: "Property owner with 5 apartments in Thamel and Lazimpat.",
  whatsapp: "9851234567",
};

export const mockAgentProfile: UserProfile = {
  user_id: "usr-agent-001",
  first_name: "Bikash",
  last_name: "Gurung",
  phone: "9861234567",
  avatar_url: "https://images.ktmapartments.com/avatars/bikash-gurung.jpg",
  bio: "Licensed real estate agent with 8 years experience in Kathmandu.",
  whatsapp: "9861234567",
};

export const mockRenter: User = {
  id: "usr-renter-001",
  email: "ram.sharma@gmail.com",
  role: "renter",
  status: "active",
  is_verified: true,
  created_at: "2024-09-01T10:00:00Z",
  profile: mockRenterProfile,
};

export const mockOwner: User = {
  id: "usr-owner-001",
  email: "sita.thapa@gmail.com",
  role: "owner",
  status: "active",
  is_verified: true,
  created_at: "2024-06-15T08:00:00Z",
  profile: mockOwnerProfile,
};

export const mockAgent: User = {
  id: "usr-agent-001",
  email: "bikash.gurung@ktmrealty.com",
  role: "agent",
  status: "active",
  is_verified: true,
  created_at: "2024-03-10T09:00:00Z",
  profile: mockAgentProfile,
};

export const mockAdmin: User = {
  id: "usr-admin-001",
  email: "admin@ktmapartments.com",
  role: "admin",
  status: "active",
  is_verified: true,
  created_at: "2024-01-01T00:00:00Z",
  profile: {
    user_id: "usr-admin-001",
    first_name: "Admin",
    last_name: "KTM",
    phone: "9800000001",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// LISTING IMAGES helper
// ─────────────────────────────────────────────────────────────────────────────
function makeImages(listingId: string, count: number): ListingImage[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `img-${listingId}-${i + 1}`,
    listing_id: listingId,
    image_url: `https://images.ktmapartments.com/listings/${listingId}/photo-${i + 1}.jpg`,
    webp_url: `https://images.ktmapartments.com/listings/${listingId}/photo-${i + 1}.webp`,
    storage_key: `listings/${listingId}/photo-${i + 1}.webp`,
    alt_text: `Property photo ${i + 1}`,
    sort_order: i,
    is_primary: i === 0,
    is_cover: i === 0,
    upload_status: "complete" as const,
    created_at: "2024-11-15T08:30:00Z",
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// LISTING LOCATIONS helper
// ─────────────────────────────────────────────────────────────────────────────
function makeLocation(listingId: string, neighborhood: Neighborhood, addressLine: string): ListingLocation {
  return {
    location_id: `loc-${listingId}`,
    listing_id: listingId,
    address_line: addressLine,
    city: "Kathmandu",
    municipality: "Kathmandu Metropolitan City",
    district: "Kathmandu",
    province: "Bagmati",
    neighborhood,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LISTINGS  (6 realistic Kathmandu listings)
// ─────────────────────────────────────────────────────────────────────────────
export const mockListings: Listing[] = [
  // ── Listing 1: Verified, featured, 2BHK Thamel ──────────────────────────
  {
    id: "lst-001",
    owner_user_id: "usr-owner-001",
    neighborhood_id: "nbh-001",
    slug: "modern-2bhk-thamel-lst-001",
    title: "Modern 2BHK Apartment in the Heart of Thamel",
    description:
      "Beautifully furnished 2-bedroom apartment located just 5 minutes walk from Thamel Chowk. Features a spacious living room, fully equipped kitchen, two attached bathrooms, and a balcony with mountain views. 24/7 security, backup power, and rooftop access included.",
    listing_type: "apartment",
    purpose: "rent",
    status: "active",
    is_verified: true,
    price: 28000,
    price_period: "monthly",
    currency: "NPR",
    security_deposit: 56000,
    price_negotiable: false,
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 950,
    floor: 3,
    total_floors: 5,
    furnishing: "fully",
    parking: true,
    pets_allowed: false,
    smoking_allowed: false,
    available_from: "2025-02-01",
    location: makeLocation("lst-001", mockNeighborhoods[0], "Thamel Marg, Ward 26"),
    owner: {
      user_id: "usr-owner-001",
      first_name: "Sita",
      last_name: "Thapa",
      phone: "985XXXXXXX",
      avatar_url: "https://images.ktmapartments.com/avatars/sita-thapa.jpg",
      email: "sita.thapa@gmail.com",
      role: "owner",
      is_verified: true,
    },
    images: makeImages("lst-001", 5),
    amenities: [mockAmenities[0], mockAmenities[1], mockAmenities[2], mockAmenities[3]],
    created_at: "2024-11-15T08:30:00Z",
    updated_at: "2025-01-10T14:00:00Z",
  },
  // ── Listing 2: Verified, 3BHK Lazimpat ──────────────────────────────────
  {
    id: "lst-002",
    owner_user_id: "usr-owner-001",
    neighborhood_id: "nbh-002",
    slug: "luxury-3bhk-lazimpat-lst-002",
    title: "Luxury 3BHK in Lazimpat — Embassy District",
    description:
      "Premium 3-bedroom apartment in the prestigious Lazimpat embassy zone. Floor-to-ceiling windows, modular kitchen, marble flooring, and dedicated parking. Walking distance to major embassies and international schools.",
    listing_type: "apartment",
    purpose: "rent",
    status: "active",
    is_verified: true,
    price: 65000,
    price_period: "monthly",
    currency: "NPR",
    security_deposit: 130000,
    price_negotiable: true,
    bedrooms: 3,
    bathrooms: 3,
    area_sqft: 1800,
    floor: 5,
    total_floors: 8,
    furnishing: "fully",
    parking: true,
    pets_allowed: true,
    smoking_allowed: false,
    available_from: "2025-03-01",
    location: makeLocation("lst-002", mockNeighborhoods[1], "Lazimpat Road, Ward 2"),
    owner: {
      user_id: "usr-owner-001",
      first_name: "Sita",
      last_name: "Thapa",
      phone: "985XXXXXXX",
      avatar_url: "https://images.ktmapartments.com/avatars/sita-thapa.jpg",
      email: "sita.thapa@gmail.com",
      role: "owner",
      is_verified: true,
    },
    images: makeImages("lst-002", 8),
    amenities: mockAmenities,
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2025-01-15T09:00:00Z",
  },
  // ── Listing 3: Verified, 1BHK Patan ─────────────────────────────────────
  {
    id: "lst-003",
    owner_user_id: "usr-agent-001",
    neighborhood_id: "nbh-003",
    slug: "cozy-1bhk-patan-lst-003",
    title: "Cozy 1BHK Studio in Patan — Near Durbar Square",
    description:
      "Affordable 1-bedroom apartment just 3 minutes from Patan Durbar Square. Quiet neighborhood, great for students and young professionals. Includes water tank and 24/7 electricity backup.",
    listing_type: "apartment",
    purpose: "rent",
    status: "active",
    is_verified: true,
    price: 15000,
    price_period: "monthly",
    currency: "NPR",
    security_deposit: 30000,
    price_negotiable: false,
    bedrooms: 1,
    bathrooms: 1,
    area_sqft: 550,
    floor: 2,
    total_floors: 4,
    furnishing: "semi",
    parking: false,
    pets_allowed: false,
    smoking_allowed: false,
    available_from: "2025-01-20",
    location: makeLocation("lst-003", mockNeighborhoods[2], "Mangal Bazar Road, Patan"),
    owner: {
      user_id: "usr-agent-001",
      first_name: "Bikash",
      last_name: "Gurung",
      phone: "986XXXXXXX",
      avatar_url: "https://images.ktmapartments.com/avatars/bikash-gurung.jpg",
      email: "bikash.gurung@ktmrealty.com",
      role: "agent",
      is_verified: true,
    },
    images: makeImages("lst-003", 4),
    amenities: [mockAmenities[1], mockAmenities[2]],
    created_at: "2025-01-05T07:00:00Z",
    updated_at: "2025-01-20T11:00:00Z",
  },
  // ── Listing 4: Unverified, pending, Koteshwor ────────────────────────────
  {
    id: "lst-004",
    owner_user_id: "usr-owner-001",
    neighborhood_id: "nbh-004",
    slug: "affordable-room-koteshwor-lst-004",
    title: "Affordable Single Room in Koteshwor",
    description:
      "Single furnished room available for rent in Koteshwor. Shared kitchen and bathroom. Close to Ring Road and bus stops. Suitable for students.",
    listing_type: "room",
    purpose: "rent",
    status: "pending",
    is_verified: false,
    price: 8000,
    price_period: "monthly",
    currency: "NPR",
    security_deposit: 16000,
    price_negotiable: true,
    bedrooms: 1,
    bathrooms: 1,
    area_sqft: 200,
    floor: 1,
    total_floors: 3,
    furnishing: "semi",
    parking: false,
    pets_allowed: false,
    smoking_allowed: false,
    available_from: "2025-02-15",
    location: makeLocation("lst-004", mockNeighborhoods[3], "Koteshwor Chowk, Ward 32"),
    owner: {
      user_id: "usr-owner-001",
      first_name: "Sita",
      last_name: "Thapa",
      phone: "985XXXXXXX",
      avatar_url: "https://images.ktmapartments.com/avatars/sita-thapa.jpg",
      email: "sita.thapa@gmail.com",
      role: "owner",
      is_verified: true,
    },
    images: makeImages("lst-004", 3),
    amenities: [mockAmenities[2]],
    created_at: "2025-01-18T12:00:00Z",
    updated_at: "2025-01-18T12:00:00Z",
  },
  // ── Listing 5: Verified, house for sale, Bhaktapur ───────────────────────
  {
    id: "lst-005",
    owner_user_id: "usr-owner-001",
    neighborhood_id: "nbh-005",
    slug: "traditional-house-bhaktapur-lst-005",
    title: "Traditional Newari House for Sale in Bhaktapur",
    description:
      "Authentic 3-storey Newari-style house near Bhaktapur Durbar Square. 4 bedrooms, courtyard, rooftop terrace. UNESCO heritage zone. Ideal for heritage tourism business or family residence.",
    listing_type: "house",
    purpose: "sale",
    status: "active",
    is_verified: true,
    price: 12500000,
    price_period: "monthly",
    currency: "NPR",
    security_deposit: null,
    price_negotiable: true,
    bedrooms: 4,
    bathrooms: 3,
    area_sqft: 2400,
    floor: 1,
    total_floors: 3,
    furnishing: "unfurnished",
    parking: false,
    pets_allowed: true,
    smoking_allowed: false,
    available_from: null,
    location: makeLocation("lst-005", mockNeighborhoods[4], "Dattatreya Square, Bhaktapur"),
    owner: {
      user_id: "usr-owner-001",
      first_name: "Sita",
      last_name: "Thapa",
      phone: "985XXXXXXX",
      avatar_url: "https://images.ktmapartments.com/avatars/sita-thapa.jpg",
      email: "sita.thapa@gmail.com",
      role: "owner",
      is_verified: true,
    },
    images: makeImages("lst-005", 10),
    amenities: [mockAmenities[2], mockAmenities[4]],
    created_at: "2024-10-20T09:00:00Z",
    updated_at: "2025-01-05T16:00:00Z",
  },
  // ── Listing 6: Verified, studio, Baneshwor ───────────────────────────────
  {
    id: "lst-006",
    owner_user_id: "usr-agent-001",
    neighborhood_id: "nbh-001",
    slug: "studio-baneshwor-lst-006",
    title: "Modern Studio Apartment in Baneshwor",
    description:
      "Compact and modern studio apartment ideal for single professionals. Fully furnished with built-in wardrobe, kitchenette, and attached bathroom. 5 minutes from New Baneshwor bus stop.",
    listing_type: "studio",
    purpose: "rent",
    status: "active",
    is_verified: true,
    price: 18000,
    price_period: "monthly",
    currency: "NPR",
    security_deposit: 36000,
    price_negotiable: false,
    bedrooms: 0,
    bathrooms: 1,
    area_sqft: 380,
    floor: 4,
    total_floors: 6,
    furnishing: "fully",
    parking: false,
    pets_allowed: false,
    smoking_allowed: false,
    available_from: "2025-02-01",
    location: makeLocation("lst-006", mockNeighborhoods[0], "New Baneshwor, Ward 10"),
    owner: {
      user_id: "usr-agent-001",
      first_name: "Bikash",
      last_name: "Gurung",
      phone: "986XXXXXXX",
      avatar_url: "https://images.ktmapartments.com/avatars/bikash-gurung.jpg",
      email: "bikash.gurung@ktmrealty.com",
      role: "agent",
      is_verified: true,
    },
    images: makeImages("lst-006", 4),
    amenities: [mockAmenities[0], mockAmenities[1], mockAmenities[7]],
    created_at: "2025-01-10T11:00:00Z",
    updated_at: "2025-01-22T08:00:00Z",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// LISTING LIST ITEMS (for search results)
// ─────────────────────────────────────────────────────────────────────────────
export const mockListingItems: ListingListItem[] = mockListings.map((l) => ({
  id: l.id,
  slug: l.slug,
  title: l.title,
  price: l.price,
  price_period: l.price_period,
  currency: l.currency,
  bedrooms: l.bedrooms,
  bathrooms: l.bathrooms,
  area_sqft: l.area_sqft,
  listing_type: l.listing_type,
  furnishing: l.furnishing,
  status: l.status,
  is_verified: l.is_verified,
  pets_allowed: l.pets_allowed,
  parking: l.parking,
  location: l.location,
  images: l.images,
  created_at: l.created_at,
}));

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATED RESPONSES
// ─────────────────────────────────────────────────────────────────────────────
export const mockListingsPage1: PaginatedResponse<ListingListItem> = {
  items: mockListingItems,
  total: 6,
  page: 1,
  page_size: 20,
  total_pages: 1,
  has_next: false,
  has_prev: false,
};

export const mockThamelListings: PaginatedResponse<ListingListItem> = {
  items: mockListingItems.filter((l) => l.location?.neighborhood?.slug === "thamel"),
  total: 2,
  page: 1,
  page_size: 20,
  total_pages: 1,
  has_next: false,
  has_prev: false,
};

export const mockPendingListings: PaginatedResponse<ListingListItem> = {
  items: mockListingItems.filter((l) => l.status === "pending"),
  total: 1,
  page: 1,
  page_size: 20,
  total_pages: 1,
  has_next: false,
  has_prev: false,
};

// ─────────────────────────────────────────────────────────────────────────────
// INQUIRIES  (3 realistic inquiries)
// ─────────────────────────────────────────────────────────────────────────────
export const mockInquiries: Inquiry[] = [
  {
    id: "inq-001",
    listing_id: "lst-001",
    sender_id: "usr-renter-001",
    owner_id: "usr-owner-001",
    message:
      "Namaste! I am very interested in this apartment. I am a software engineer working at Leapfrog Technology in Thamel. Could you please let me know if the apartment is still available and if I can schedule a visit this weekend?",
    status: "pending",
    owner_reply: null,
    move_in_date: "2025-02-15",
    created_at: "2025-01-20T14:30:00Z",
    updated_at: "2025-01-20T14:30:00Z",
    listing: mockListingItems[0],
    sender: mockRenterProfile,
  },
  {
    id: "inq-002",
    listing_id: "lst-002",
    sender_id: "usr-renter-001",
    owner_id: "usr-owner-001",
    message:
      "Hello, I am interested in the Lazimpat apartment. I work at the US Embassy and need a place close to work. Is parking included in the rent? Also, is the lease flexible for a 6-month contract?",
    status: "replied",
    owner_reply:
      "Namaste! Yes, parking is included. We can offer a 6-month lease with a slightly higher monthly rate. Please call me at 9851234567 to discuss further.",
    move_in_date: "2025-03-01",
    created_at: "2025-01-18T09:15:00Z",
    updated_at: "2025-01-19T11:00:00Z",
    listing: mockListingItems[1],
    sender: mockRenterProfile,
  },
  {
    id: "inq-003",
    listing_id: "lst-003",
    sender_id: "usr-renter-001",
    owner_id: "usr-agent-001",
    message:
      "I am a student at Tribhuvan University and looking for an affordable place near Patan. Is this still available? Can I visit tomorrow morning?",
    status: "closed",
    owner_reply: "Sorry, this apartment has been rented. Please check our other listings.",
    move_in_date: null,
    created_at: "2025-01-15T16:00:00Z",
    updated_at: "2025-01-16T08:00:00Z",
    listing: mockListingItems[2],
    sender: mockRenterProfile,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// VISIT REQUESTS
// ─────────────────────────────────────────────────────────────────────────────
export const mockVisitRequests: VisitRequest[] = [
  {
    id: "vis-001",
    listing_id: "lst-001",
    requester_id: "usr-renter-001",
    preferred_date: "2025-02-01",
    status: "pending",
    confirmed_date: null,
    notes: "I am available in the morning between 10am and 12pm. Please confirm.",
    created_at: "2025-01-22T10:00:00Z",
    listing: mockListingItems[0],
  },
  {
    id: "vis-002",
    listing_id: "lst-002",
    requester_id: "usr-renter-001",
    preferred_date: "2025-02-05",
    status: "confirmed",
    confirmed_date: "2025-02-05",
    notes: "Afternoon visit preferred.",
    created_at: "2025-01-20T15:00:00Z",
    listing: mockListingItems[1],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// FAVORITES
// ─────────────────────────────────────────────────────────────────────────────
export const mockFavorites: Favorite[] = [
  {
    user_id: "usr-renter-001",
    listing_id: "lst-001",
    created_at: "2025-01-10T12:00:00Z",
    listing: mockListingItems[0],
  },
  {
    user_id: "usr-renter-001",
    listing_id: "lst-002",
    created_at: "2025-01-12T09:00:00Z",
    listing: mockListingItems[1],
  },
  {
    user_id: "usr-renter-001",
    listing_id: "lst-005",
    created_at: "2025-01-15T16:30:00Z",
    listing: mockListingItems[4],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// AUTH TOKENS (simulated JWT responses)
// ─────────────────────────────────────────────────────────────────────────────
export const mockAuthTokens = {
  access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3ItcmVudGVyLTAwMSIsImVtYWlsIjoicmFtLnNoYXJtYUBnbWFpbC5jb20iLCJyb2xlIjoicmVudGVyIiwic3RhdHVzIjoiYWN0aXZlIiwiaWF0IjoxNzEwMDAwMDAwLCJleHAiOjE3MTAwMDA5MDB9.mock_signature",
  token_type: "bearer",
  user: mockRenter,
};

export const mockOwnerAuthTokens = {
  access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3Itb3duZXItMDAxIiwiZW1haWwiOiJzaXRhLnRoYXBhQGdtYWlsLmNvbSIsInJvbGUiOiJvd25lciIsInN0YXR1cyI6ImFjdGl2ZSIsImlhdCI6MTcxMDAwMDAwMCwiZXhwIjoxNzEwMDAwOTAwfQ.mock_signature",
  token_type: "bearer",
  user: mockOwner,
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────
export const mockAdminAnalytics: AdminAnalyticsOverview = {
  total_listings: 847,
  active_listings: 612,
  pending_listings: 43,
  total_users: 3241,
  new_users_today: 12,
  total_inquiries: 8934,
  inquiries_today: 47,
  total_views: 124567,
  top_neighborhoods: [
    { neighborhood: "Thamel", count: 142 },
    { neighborhood: "Lazimpat", count: 87 },
    { neighborhood: "Patan", count: 93 },
    { neighborhood: "Koteshwor", count: 118 },
    { neighborhood: "Bhaktapur", count: 54 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT LOGS
// ─────────────────────────────────────────────────────────────────────────────
export const mockAuditLogs: AuditLog[] = [
  {
    id: "log-001",
    actor_id: "usr-admin-001",
    action: "listing.approved",
    target_type: "listing",
    target_id: "lst-001",
    before_state: { status: "pending" },
    after_state: { status: "active" },
    ip_address: "192.168.1.1",
    created_at: "2024-11-15T09:00:00Z",
    actor: mockAdmin.profile,
  },
  {
    id: "log-002",
    actor_id: "usr-admin-001",
    action: "user.suspended",
    target_type: "user",
    target_id: "usr-renter-001",
    before_state: { status: "active" },
    after_state: { status: "suspended" },
    ip_address: "192.168.1.1",
    created_at: "2025-01-10T14:30:00Z",
    actor: mockAdmin.profile,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────────────────────────────────────────
export const mockReports: Report[] = [
  {
    id: "rep-001",
    listing_id: "lst-004",
    reporter_id: "usr-renter-001",
    reason: "misleading",
    status: "open",
    resolution_note: null,
    created_at: "2025-01-19T10:00:00Z",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PRICE RANGE BUCKETS (for filter tests)
// ─────────────────────────────────────────────────────────────────────────────
export const mockListingsByPrice = {
  under10k: mockListingItems.filter((l) => Number(l.price) < 10000),
  between10kAnd30k: mockListingItems.filter((l) => Number(l.price) >= 10000 && Number(l.price) <= 30000),
  above30k: mockListingItems.filter((l) => Number(l.price) > 30000),
};

export const mockListingsByFurnishing = {
  fully: mockListingItems.filter((l) => l.furnishing === "fully"),
  semi: mockListingItems.filter((l) => l.furnishing === "semi"),
  unfurnished: mockListingItems.filter((l) => l.furnishing === "unfurnished"),
};

export const mockListingsByBedrooms = {
  studio: mockListingItems.filter((l) => l.bedrooms === 0),
  oneBed: mockListingItems.filter((l) => l.bedrooms === 1),
  twoBed: mockListingItems.filter((l) => l.bedrooms === 2),
  threePlus: mockListingItems.filter((l) => (l.bedrooms ?? 0) >= 3),
};
