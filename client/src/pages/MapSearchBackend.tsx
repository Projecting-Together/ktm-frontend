/**
 * Map Search Page - Backend Connected
 * Interactive map-based property search with markers and filtering
 * Connected to FastAPI backend
 */

import { useState, useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import { MapView } from "@/components/Map";
import { ensureLeafletDefaultIcons } from "../../../components/map/leaflet-defaults";
import PropertyDetailsModal from "@/components/PropertyDetailsModal";
import Filters from "@/components/Filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronDown, Filter, List, Map as MapIcon, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getListings, Listing, ListingFilters, initializeAuth } from "@/lib/api-backend";
import { sampleProperties, neighborhoods } from "@/lib/sampleData";
import PropertyCard from "@/components/PropertyCard";
import { SearchFilters } from "@/../../shared/types";

interface MarkerData {
  marker: L.Marker;
  listing: Listing;
}

export default function MapSearchBackend() {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, MarkerData>>(new Map());

  const [listingType, setListingType] = useState<"rent" | "sale">("rent");
  const [filters, setFilters] = useState<Partial<SearchFilters>>({
    listingType: "rent",
  });
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Fetch listings from backend
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);

      const backendFilters: ListingFilters = {
        skip: 0,
        limit: 100,
        listing_type: listingType === "rent" ? "rent" : "sale",
      };

      // Add price filters
      if (filters.minPrice !== undefined) {
        backendFilters.min_price = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        backendFilters.max_price = filters.maxPrice;
      }

      // Add bedroom filters
      if (filters.minBedrooms !== undefined) {
        backendFilters.bedrooms = filters.minBedrooms;
      }

      // Add search query
      if (searchQuery) {
        backendFilters.search = searchQuery;
      }

      const response = await getListings(backendFilters);

      if (response.error) {
        setError(response.error.message);
        // Fall back to sample data if backend fails
        setListings(sampleProperties as any);
      } else if (response.data?.items) {
        setListings(response.data.items);
      } else {
        setListings([]);
      }

      setLoading(false);
    };

    fetchListings();
  }, [listingType, filters, searchQuery]);

  // Filter listings based on current filters
  const displayedListings = useMemo(() => {
    return listings.filter((listing) => {
      if (
        filters.minPrice !== undefined &&
        listing.price &&
        listing.price < filters.minPrice
      )
        return false;
      if (
        filters.maxPrice !== undefined &&
        listing.price &&
        listing.price > filters.maxPrice
      )
        return false;
      if (
        filters.minBedrooms !== undefined &&
        listing.bedrooms &&
        listing.bedrooms < filters.minBedrooms
      )
        return false;
      if (
        filters.maxBedrooms !== undefined &&
        listing.bedrooms &&
        listing.bedrooms > filters.maxBedrooms
      )
        return false;
      if (
        filters.minBathrooms !== undefined &&
        listing.bathrooms &&
        listing.bathrooms < filters.minBathrooms
      )
        return false;
      if (
        filters.maxBathrooms !== undefined &&
        listing.bathrooms &&
        listing.bathrooms > filters.maxBathrooms
      )
        return false;
      if (filters.furnished !== undefined && listing.furnished !== filters.furnished)
        return false;

      return true;
    });
  }, [listings, filters]);

  // Update markers when properties change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    ensureLeafletDefaultIcons();

    markersRef.current.forEach(({ marker }) => {
      marker.remove();
    });
    markersRef.current.clear();

    displayedListings.forEach((listing) => {
      if (!listing.location?.latitude || !listing.location?.longitude) return;

      const lat = Number(listing.location.latitude);
      const lng = Number(listing.location.longitude);

      const marker = L.marker([lat, lng], { title: listing.title }).addTo(map);

      const html = `
        <div class="p-2 max-w-xs">
          <h3 class="font-semibold text-sm">${listing.title}</h3>
          <p class="text-xs text-gray-600">${listing.location?.city || "Kathmandu"}</p>
          <p class="text-sm font-bold text-blue-600 mt-1">
            NPR ${listing.price?.toLocaleString() || "N/A"}
            ${listing.price_period ? `/${listing.price_period}` : ""}
          </p>
          <p class="text-xs text-gray-600 mt-1">
            ${listing.bedrooms || 0} bed • ${listing.bathrooms || 0} bath
          </p>
        </div>
      `;

      marker.bindPopup(html);
      marker.on("click", () => {
        setSelectedListing(listing);
      });

      markersRef.current.set(listing.id, { marker, listing });
    });
  }, [displayedListings]);

  const handlePropertySelect = (listing: Listing) => {
    setSelectedListing(listing);
    setShowPropertyModal(true);
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Filters Sidebar */}
      <div
        className={cn(
          "flex-shrink-0 w-80 bg-white border-r border-border overflow-y-auto transition-all duration-300 max-md:absolute max-md:z-40 max-md:h-full max-md:shadow-lg",
          !showFilters && "max-md:-translate-x-full"
        )}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button
              onClick={() => setShowFilters(false)}
              className="md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <Filters
            onFilterChange={handleFilterChange}
          />

          {/* Search Box */}
          <div className="mt-6">
            <label className="text-sm font-medium mb-2 block">Search Location</label>
            <Input
              placeholder="Search by location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Results Count */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                `${displayedListings.length} properties found`
              )}
            </p>
            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 h-16 bg-white border-b border-border px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Filter className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">Map Search</h1>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "map" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("map")}
              className="gap-2"
            >
              <MapIcon className="w-4 h-4" />
              Map
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="gap-2"
            >
              <List className="w-4 h-4" />
              List
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {viewMode === "map" ? (
            <MapView
              initialCenter={{ lat: 27.7172, lng: 85.324 }}
              initialZoom={13}
              onMapReady={(map) => {
                mapRef.current = map;
              }}
              className="h-full min-h-[400px] w-full"
            />
          ) : (
            <div className="overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedListings.map((listing) => (
                  <PropertyCard
                    key={listing.id}
                    property={{
                      id: listing.id,
                      title: listing.title,
                      price: listing.price || 0,
                      bedrooms: listing.bedrooms || 0,
                      bathrooms: listing.bathrooms || 0,
                      address: listing.location?.address_line || listing.location?.city || "Kathmandu",
                      neighborhood: listing.location?.municipality || "Kathmandu",
                      images: [listing.images?.[0]?.image_url || "/placeholder.jpg"],
                      listingType: (listing.listing_type as "rent" | "sale") || "rent",
                      furnished: listing.furnished || false,
                      petFriendly: listing.pets_allowed || false,
                      description: listing.description || "",
                      squareFeet: listing.area_sqft || 0,
                      propertyType: "apartment",
                      features: [],
                      parking: 0,
                      latitude: Number(listing.location?.latitude) || 27.7172,
                      longitude: Number(listing.location?.longitude) || 85.324,
                      listedDate: listing.created_at,
                      daysOnMarket: 0,
                    }}
                    onViewDetails={() => handlePropertySelect(listing)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Property Details Modal */}
      {selectedListing && (
        <PropertyDetailsModal
          property={{
            id: selectedListing.id,
            title: selectedListing.title,
            price: selectedListing.price || 0,
            bedrooms: selectedListing.bedrooms || 0,
            bathrooms: selectedListing.bathrooms || 0,
            address: selectedListing.location?.address_line || selectedListing.location?.city || "Kathmandu",
            neighborhood: selectedListing.location?.municipality || "Kathmandu",
            images: [selectedListing.images?.[0]?.image_url || "/placeholder.jpg"],
            listingType: (selectedListing.listing_type as "rent" | "sale") || "rent",
            furnished: selectedListing.furnished || false,
            petFriendly: selectedListing.pets_allowed || false,
            description: selectedListing.description || "",
            squareFeet: selectedListing.area_sqft || 0,
            propertyType: "apartment",
            features: [],
            parking: 0,
            latitude: Number(selectedListing.location?.latitude) || 27.7172,
            longitude: Number(selectedListing.location?.longitude) || 85.324,
            listedDate: selectedListing.created_at,
            daysOnMarket: 0,
          }}
          isOpen={showPropertyModal}
          onClose={() => {
            setShowPropertyModal(false);
            setSelectedListing(null);
          }}
        />
      )}
    </div>
  );
}
