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
  TokenPair,
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
/**
 * Public Unsplash URLs (verified HTTP 200, hotlink-friendly). Used for mock listings so map/cards
 * do not rely on production CDN paths that may 404 in local dev.
 */
const MOCK_LISTING_IMAGE_URLS = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
];

function makeImages(listingId: string, count: number): ListingImage[] {
  const n = Number.parseInt(listingId.replace(/\D/g, ""), 10) || 0;
  return Array.from({ length: count }, (_, i) => {
    const url = MOCK_LISTING_IMAGE_URLS[(n + i) % MOCK_LISTING_IMAGE_URLS.length];
    return {
      id: `img-${listingId}-${i + 1}`,
      listing_id: listingId,
      image_url: url,
      webp_url: url,
      storage_key: `listings/${listingId}/photo-${i + 1}.webp`,
      alt_text: `Property photo ${i + 1}`,
      sort_order: i,
      is_primary: i === 0,
      is_cover: i === 0,
      upload_status: "complete" as const,
      created_at: "2024-11-15T08:30:00Z",
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// LISTING LOCATIONS helper
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Small deterministic offset from the neighborhood center so map markers are not stacked
 * on one pixel (SearchMap / Leaflet need `location.latitude` & `location.longitude`).
 */
function listingLatLngOffset(listingId: string): { dLat: number; dLng: number } {
  let hash = 0;
  for (let i = 0; i < listingId.length; i++) {
    hash = (hash << 5) - hash + listingId.charCodeAt(i);
    hash |= 0;
  }
  const spread = 0.00028;
  const dLat = ((hash % 19) - 9) * spread;
  const dLng = ((((hash >> 5) % 19) - 9) * spread);
  return { dLat, dLng };
}

function makeLocation(
  listingId: string,
  neighborhood: Neighborhood,
  addressLine: string,
  overrides?: Partial<Pick<ListingLocation, "city" | "district" | "municipality">>,
): ListingLocation {
  const baseLat = neighborhood.lat ?? 27.7172;
  const baseLng = neighborhood.lng ?? 85.324;
  const { dLat, dLng } = listingLatLngOffset(listingId);
  return {
    location_id: `loc-${listingId}`,
    listing_id: listingId,
    address_line: addressLine,
    city: overrides?.city ?? "Kathmandu",
    municipality: overrides?.municipality ?? "Kathmandu Metropolitan City",
    district: overrides?.district ?? "Kathmandu",
    province: "Bagmati",
    neighborhood,
    latitude: baseLat + dLat,
    longitude: baseLng + dLng,
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
    location: makeLocation("lst-005", mockNeighborhoods[4], "Dattatreya Square, Bhaktapur", {
      city: "Bhaktapur",
      district: "Bhaktapur",
      municipality: "Bhaktapur Municipality",
    }),
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
  // ── Listing 7: Verified, townhouse for sale, Lazimpat ────────────────────
  {
    id: "lst-007",
    owner_user_id: "usr-owner-001",
    neighborhood_id: "nbh-002",
    slug: "townhouse-lazimpat-sale-lst-007",
    title: "Contemporary Townhouse for Sale in Lazimpat",
    description:
      "Well-maintained 3.5-storey townhouse near embassies and schools in Lazimpat. Includes private parking, modular kitchen, and two family living spaces.",
    listing_type: "house",
    purpose: "sale",
    status: "active",
    is_verified: true,
    price: 28500000,
    price_period: "yearly",
    currency: "NPR",
    security_deposit: null,
    price_negotiable: true,
    bedrooms: 5,
    bathrooms: 4,
    area_sqft: 3200,
    floor: 1,
    total_floors: 4,
    furnishing: "semi",
    parking: true,
    pets_allowed: true,
    smoking_allowed: false,
    available_from: null,
    location: makeLocation("lst-007", mockNeighborhoods[1], "Lazimpat Aawas Marg, Ward 2"),
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
    images: makeImages("lst-007", 7),
    amenities: [mockAmenities[1], mockAmenities[3], mockAmenities[4], mockAmenities[5]],
    created_at: "2024-11-01T07:45:00Z",
    updated_at: "2025-01-19T10:15:00Z",
  },
  // ── Listing 8: Verified, apartment for sale, Patan ───────────────────────
  {
    id: "lst-008",
    owner_user_id: "usr-agent-001",
    neighborhood_id: "nbh-003",
    slug: "family-apartment-patan-sale-lst-008",
    title: "Sunny 3BHK Family Apartment for Sale in Patan",
    description:
      "Corner apartment with all-day sunlight, hardwood flooring, and reserve water system. Located in a peaceful lane, 10 minutes from Patan Durbar Square.",
    listing_type: "apartment",
    purpose: "sale",
    status: "active",
    is_verified: true,
    price: 16800000,
    price_period: "yearly",
    currency: "NPR",
    security_deposit: null,
    price_negotiable: true,
    bedrooms: 3,
    bathrooms: 2,
    area_sqft: 1650,
    floor: 5,
    total_floors: 7,
    furnishing: "semi",
    parking: true,
    pets_allowed: true,
    smoking_allowed: false,
    available_from: null,
    location: makeLocation("lst-008", mockNeighborhoods[2], "Pulchowk Lane, Patan"),
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
    images: makeImages("lst-008", 6),
    amenities: [mockAmenities[0], mockAmenities[1], mockAmenities[4], mockAmenities[7]],
    created_at: "2024-12-10T09:25:00Z",
    updated_at: "2025-01-21T12:40:00Z",
  },
  // ── Listing 9: Verified, compact house for sale, Koteshwor ───────────────
  {
    id: "lst-009",
    owner_user_id: "usr-owner-001",
    neighborhood_id: "nbh-004",
    slug: "compact-house-koteshwor-sale-lst-009",
    title: "Compact 2.5 Storey House for Sale in Koteshwor",
    description:
      "Well-connected family home close to Ring Road and schools. Includes rooftop utility space, secure boundary wall, and covered scooter parking.",
    listing_type: "house",
    purpose: "sale",
    status: "active",
    is_verified: true,
    price: 14900000,
    price_period: "yearly",
    currency: "NPR",
    security_deposit: null,
    price_negotiable: true,
    bedrooms: 4,
    bathrooms: 3,
    area_sqft: 2100,
    floor: 1,
    total_floors: 3,
    furnishing: "unfurnished",
    parking: true,
    pets_allowed: true,
    smoking_allowed: false,
    available_from: null,
    location: makeLocation("lst-009", mockNeighborhoods[3], "Koteshwor Inner Road, Ward 32"),
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
    images: makeImages("lst-009", 5),
    amenities: [mockAmenities[2], mockAmenities[3], mockAmenities[4]],
    created_at: "2024-11-23T06:50:00Z",
    updated_at: "2025-01-14T13:35:00Z",
  },
  // ── Listing 10: Verified, premium penthouse for sale, Thamel ─────────────
  {
    id: "lst-010",
    owner_user_id: "usr-agent-001",
    neighborhood_id: "nbh-001",
    slug: "penthouse-thamel-sale-lst-010",
    title: "Premium Penthouse for Sale Near Thamel Heritage Zone",
    description:
      "Duplex penthouse with private terrace, city views, and upgraded interiors. Great fit for owner-occupiers seeking central Kathmandu access.",
    listing_type: "apartment",
    purpose: "sale",
    status: "active",
    is_verified: true,
    price: 31200000,
    price_period: "yearly",
    currency: "NPR",
    security_deposit: null,
    price_negotiable: true,
    bedrooms: 4,
    bathrooms: 4,
    area_sqft: 2900,
    floor: 8,
    total_floors: 8,
    furnishing: "fully",
    parking: true,
    pets_allowed: true,
    smoking_allowed: false,
    available_from: null,
    location: makeLocation("lst-010", mockNeighborhoods[0], "Paknajol Road, Ward 26"),
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
    images: makeImages("lst-010", 8),
    amenities: [mockAmenities[0], mockAmenities[1], mockAmenities[4], mockAmenities[6], mockAmenities[7]],
    created_at: "2024-10-30T10:10:00Z",
    updated_at: "2025-01-22T14:50:00Z",
  },
  // ── Listing 11: Verified, apartment for sale, Bhaktapur ───────────────────
  {
    id: "lst-011",
    owner_user_id: "usr-owner-001",
    neighborhood_id: "nbh-005",
    slug: "family-flat-bhaktapur-sale-lst-011",
    title: "Ready-to-Move 3BHK Family Flat for Sale in Bhaktapur",
    description:
      "Spacious family flat near Siddha Pokhari with attached balconies, backup water, and nearby schools. Suitable for end-use buyers.",
    listing_type: "apartment",
    purpose: "sale",
    status: "active",
    is_verified: true,
    price: 12100000,
    price_period: "yearly",
    currency: "NPR",
    security_deposit: null,
    price_negotiable: true,
    bedrooms: 3,
    bathrooms: 2,
    area_sqft: 1520,
    floor: 3,
    total_floors: 5,
    furnishing: "semi",
    parking: true,
    pets_allowed: true,
    smoking_allowed: false,
    available_from: null,
    location: makeLocation("lst-011", mockNeighborhoods[4], "Suryabinayak Link Road, Bhaktapur", {
      city: "Bhaktapur",
      district: "Bhaktapur",
      municipality: "Suryabinayak Municipality",
    }),
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
    images: makeImages("lst-011", 6),
    amenities: [mockAmenities[1], mockAmenities[2], mockAmenities[4], mockAmenities[5]],
    created_at: "2024-12-19T08:35:00Z",
    updated_at: "2025-01-20T09:20:00Z",
  },
  // ── Listing 12: Verified, villa for sale, Lazimpat ────────────────────────
  {
    id: "lst-012",
    owner_user_id: "usr-owner-001",
    neighborhood_id: "nbh-002",
    slug: "villa-lazimpat-sale-lst-012",
    title: "Detached Villa for Sale in Prime Lazimpat Location",
    description:
      "Standalone villa with landscaped front yard, servant quarter, and ample family space. Walkable to embassies, cafes, and hospitals.",
    listing_type: "house",
    purpose: "sale",
    status: "active",
    is_verified: true,
    price: 44800000,
    price_period: "yearly",
    currency: "NPR",
    security_deposit: null,
    price_negotiable: true,
    bedrooms: 6,
    bathrooms: 5,
    area_sqft: 4100,
    floor: 1,
    total_floors: 3,
    furnishing: "semi",
    parking: true,
    pets_allowed: true,
    smoking_allowed: false,
    available_from: null,
    location: makeLocation("lst-012", mockNeighborhoods[1], "Panipokhari Extension, Ward 3"),
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
    images: makeImages("lst-012", 9),
    amenities: [mockAmenities[1], mockAmenities[2], mockAmenities[3], mockAmenities[4], mockAmenities[5]],
    created_at: "2024-09-27T11:55:00Z",
    updated_at: "2025-01-23T10:10:00Z",
  },
  // ── Listing 13: Verified, investment apartment for sale, Patan ────────────
  {
    id: "lst-013",
    owner_user_id: "usr-agent-001",
    neighborhood_id: "nbh-003",
    slug: "investment-apartment-patan-sale-lst-013",
    title: "Investment-Ready 2BHK Apartment for Sale in Patan",
    description:
      "Low-maintenance 2BHK in a high-demand rental pocket of Patan. Strong resale potential with reliable utility infrastructure and lift access.",
    listing_type: "apartment",
    purpose: "sale",
    status: "active",
    is_verified: true,
    price: 13250000,
    price_period: "yearly",
    currency: "NPR",
    security_deposit: null,
    price_negotiable: true,
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 1280,
    floor: 4,
    total_floors: 6,
    furnishing: "semi",
    parking: true,
    pets_allowed: false,
    smoking_allowed: false,
    available_from: null,
    location: makeLocation("lst-013", mockNeighborhoods[2], "Jawalakhel Side Lane, Patan"),
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
    images: makeImages("lst-013", 5),
    amenities: [mockAmenities[0], mockAmenities[1], mockAmenities[4], mockAmenities[7]],
    created_at: "2024-12-28T07:05:00Z",
    updated_at: "2025-01-24T08:45:00Z",
  },
];

function cloneListing<T extends Listing>(listing: T): T {
  return {
    ...listing,
    location: listing.location ? { ...listing.location } : listing.location,
    images: listing.images.map((image) => ({ ...image })),
    amenities: listing.amenities.map((amenity) => ({ ...amenity })),
    owner: listing.owner ? { ...listing.owner } : listing.owner,
  };
}

function getBaseRentListing(): Listing {
  const listing = mockListings.find((item) => item.purpose === "rent");
  if (!listing) {
    throw new Error("Expected at least one rent listing in mockListings");
  }

  return cloneListing(listing);
}

export function buildRentListingFull(): Listing {
  return {
    ...getBaseRentListing(),
    id: "rent-variant-full",
    slug: "rent-variant-full",
  };
}

export function buildRentListingSparse(): Listing {
  const base = getBaseRentListing();
  return {
    ...base,
    id: "rent-variant-sparse",
    slug: "rent-variant-sparse",
    description: null,
    amenities: [],
    furnishing: null,
    floor: null,
    total_floors: null,
    bedrooms: null,
    bathrooms: null,
    area_sqft: null,
    parking: null,
    pets_allowed: null,
    smoking_allowed: null,
    available_from: null,
    location: base.location
      ? {
          ...base.location,
          latitude: null,
          longitude: null,
        }
      : base.location,
  };
}

export function buildRentListingMixed(): Listing {
  const base = getBaseRentListing();
  return {
    ...base,
    id: "rent-variant-mixed",
    slug: "rent-variant-mixed",
    description: "Balanced rent fixture with partial utility coverage for mixed-state rendering.",
    bedrooms: 2,
    bathrooms: 1,
    area_sqft: 920,
    furnishing: "semi",
    floor: 2,
    total_floors: 5,
    parking: false,
    pets_allowed: true,
    smoking_allowed: null,
    available_from: null,
    amenities: [mockAmenities[0], mockAmenities[2]],
    location: base.location
      ? {
          ...base.location,
          latitude: "27.7172",
          longitude: "85.3240",
        }
      : base.location,
  };
}

export function buildRentListingPremium(): Listing {
  const base = getBaseRentListing();
  return {
    ...base,
    id: "rent-variant-premium",
    slug: "rent-variant-premium",
    title: "Premium Penthouse Rental Fixture",
    description: "High-spec rent fixture with extensive amenities for premium detail states.",
    price: 85000,
    security_deposit: 170000,
    bedrooms: 4,
    bathrooms: 4,
    area_sqft: 1800,
    furnishing: "fully",
    floor: 8,
    total_floors: 10,
    parking: true,
    pets_allowed: true,
    smoking_allowed: false,
    available_from: "2026-05-01",
    amenities: [mockAmenities[0], mockAmenities[1], mockAmenities[4], mockAmenities[6], mockAmenities[7]],
  };
}

export function buildRentListingMinimal(): Listing {
  const base = getBaseRentListing();
  return {
    ...base,
    id: "rent-variant-minimal",
    slug: "rent-variant-minimal",
    title: "Minimal Rent Fixture",
    description: "Compact city unit.",
    bedrooms: 1,
    bathrooms: 1,
    area_sqft: 350,
    furnishing: "unfurnished",
    floor: null,
    total_floors: null,
    parking: null,
    pets_allowed: null,
    smoking_allowed: null,
    available_from: null,
    amenities: [],
  };
}

export const mockRentListingVariants: Listing[] = [
  buildRentListingFull(),
  buildRentListingSparse(),
  buildRentListingMixed(),
  buildRentListingPremium(),
  buildRentListingMinimal(),
];

// ─────────────────────────────────────────────────────────────────────────────
// LISTING LIST ITEMS (for search results)
// ─────────────────────────────────────────────────────────────────────────────
export const mockListingItems: ListingListItem[] = mockListings.map((l) => ({
  id: l.id,
  slug: l.slug,
  title: l.title,
  purpose: l.purpose,
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
  total: mockListingItems.length,
  page: 1,
  page_size: 20,
  total_pages: 1,
  has_next: false,
  has_prev: false,
};

export const mockThamelListings: PaginatedResponse<ListingListItem> = {
  items: mockListingItems.filter((l) => l.location?.neighborhood?.slug === "thamel"),
  total: mockListingItems.filter((l) => l.location?.neighborhood?.slug === "thamel").length,
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
  {
    id: "inq-004",
    listing_id: "lst-007",
    sender_id: "usr-renter-001",
    owner_id: "usr-owner-001",
    message:
      "Namaste. We are planning to buy a family home in Lazimpat this quarter. Can we schedule a weekend site visit and discuss final negotiable pricing?",
    status: "pending",
    owner_reply: null,
    move_in_date: null,
    created_at: "2025-01-21T10:20:00Z",
    updated_at: "2025-01-21T10:20:00Z",
    listing: mockListingItems.find((listing) => listing.id === "lst-007") ?? null,
    sender: mockRenterProfile,
  },
  {
    id: "inq-005",
    listing_id: "lst-010",
    sender_id: "usr-renter-001",
    owner_id: "usr-agent-001",
    message:
      "Hello, I am a returning NRP buyer and interested in the Thamel penthouse. Could you share legal paperwork status and available viewing slots this week?",
    status: "replied",
    owner_reply:
      "Thank you for your interest. The ownership documents are ready for verification and we can host viewings on Wednesday and Saturday.",
    move_in_date: null,
    created_at: "2025-01-22T13:45:00Z",
    updated_at: "2025-01-23T08:10:00Z",
    listing: mockListingItems.find((listing) => listing.id === "lst-010") ?? null,
    sender: mockRenterProfile,
  },
  {
    id: "inq-006",
    listing_id: "lst-012",
    sender_id: "usr-renter-001",
    owner_id: "usr-owner-001",
    message:
      "We are comparing two villas in Lazimpat and need to confirm parking capacity and water backup before final offer submission.",
    status: "pending",
    owner_reply: null,
    move_in_date: null,
    created_at: "2025-01-23T09:30:00Z",
    updated_at: "2025-01-23T09:30:00Z",
    listing: mockListingItems.find((listing) => listing.id === "lst-012") ?? null,
    sender: mockRenterProfile,
  },
  {
    id: "inq-007",
    listing_id: "lst-005",
    sender_id: "usr-renter-001",
    owner_id: "usr-owner-001",
    message:
      "We are evaluating heritage homes for purchase in Bhaktapur. Please confirm structural renovation history and expected closing timeline.",
    status: "pending",
    owner_reply: null,
    move_in_date: null,
    created_at: "2025-01-23T16:10:00Z",
    updated_at: "2025-01-23T16:10:00Z",
    listing: mockListingItems.find((listing) => listing.id === "lst-005") ?? null,
    sender: mockRenterProfile,
  },
  {
    id: "inq-008",
    listing_id: "lst-008",
    sender_id: "usr-renter-001",
    owner_id: "usr-agent-001",
    message:
      "I am a first-time buyer looking for a family apartment in Patan. Can you share final expected closing costs and available site-visit slots?",
    status: "replied",
    owner_reply:
      "Yes, we can share a detailed cost sheet and host a walkthrough this Friday or Sunday afternoon.",
    move_in_date: null,
    created_at: "2025-01-24T07:40:00Z",
    updated_at: "2025-01-24T10:05:00Z",
    listing: mockListingItems.find((listing) => listing.id === "lst-008") ?? null,
    sender: mockRenterProfile,
  },
  {
    id: "inq-009",
    listing_id: "lst-009",
    sender_id: "usr-renter-001",
    owner_id: "usr-owner-001",
    message:
      "Is the Koteshwor house title transfer clear and can we arrange an inspection focused on utility lines and parking access?",
    status: "pending",
    owner_reply: null,
    move_in_date: null,
    created_at: "2025-01-24T09:10:00Z",
    updated_at: "2025-01-24T09:10:00Z",
    listing: mockListingItems.find((listing) => listing.id === "lst-009") ?? null,
    sender: mockRenterProfile,
  },
  {
    id: "inq-010",
    listing_id: "lst-011",
    sender_id: "usr-renter-001",
    owner_id: "usr-owner-001",
    message:
      "We are relocating to Bhaktapur and considering this flat for purchase. Could you confirm if bank financing documents are prepared?",
    status: "replied",
    owner_reply:
      "Yes, required valuation and ownership documents are ready for bank review.",
    move_in_date: null,
    created_at: "2025-01-24T11:25:00Z",
    updated_at: "2025-01-24T12:15:00Z",
    listing: mockListingItems.find((listing) => listing.id === "lst-011") ?? null,
    sender: mockRenterProfile,
  },
  {
    id: "inq-011",
    listing_id: "lst-013",
    sender_id: "usr-renter-001",
    owner_id: "usr-agent-001",
    message:
      "Can we compare current rental yield estimates for this Patan investment apartment before making an offer?",
    status: "pending",
    owner_reply: null,
    move_in_date: null,
    created_at: "2025-01-24T13:05:00Z",
    updated_at: "2025-01-24T13:05:00Z",
    listing: mockListingItems.find((listing) => listing.id === "lst-013") ?? null,
    sender: mockRenterProfile,
  },
];

export const mockSaleListings = mockListings.filter(
  (listing) => listing.purpose === "sale" && listing.status === "active"
);
export const mockSaleInquiries = mockInquiries.filter(
  (inquiry) => inquiry.listing?.purpose === "sale" && mockSaleListings.some((listing) => listing.id === inquiry.listing_id)
);

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
export const mockAuthTokens: TokenPair = {
  access_token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3ItcmVudGVyLTAwMSIsImVtYWlsIjoicmFtLnNoYXJtYUBnbWFpbC5jb20iLCJyb2xlIjoicmVudGVyIiwic3RhdHVzIjoiYWN0aXZlIiwiaWF0IjoxNzEwMDAwMDAwLCJleHAiOjE3MTAwMDA5MDB9.mock_signature",
  refresh_token: "mock-refresh-renter",
  token_type: "bearer",
};

export const mockOwnerAuthTokens: TokenPair = {
  access_token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3Itb3duZXItMDAxIiwiZW1haWwiOiJzaXRhLnRoYXBhQGdtYWlsLmNvbSIsInJvbGUiOiJvd25lciIsInN0YXR1cyI6ImFjdGl2ZSIsImlhdCI6MTcxMDAwMDAwMCwiZXhwIjoxNzEwMDAwOTAwfQ.mock_signature",
  refresh_token: "mock-refresh-owner",
  token_type: "bearer",
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────
export const mockAdminAnalytics: AdminAnalyticsOverview = {
  total_listings: 964,
  active_listings: 702,
  pending_listings: 43,
  total_users: 3589,
  new_users_today: 17,
  total_inquiries: 11348,
  inquiries_today: 69,
  total_views: 156432,
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
