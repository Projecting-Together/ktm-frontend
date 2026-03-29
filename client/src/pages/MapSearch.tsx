/**
 * Map Search Page
 * Interactive map-based property search with markers and filtering
 * Design: Modern Minimalist with Himalayan Warmth
 */

import { useState, useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import { Property, SearchFilters } from "@/../../shared/types";
import { sampleProperties } from "@/lib/sampleData";
import { MapView } from "@/components/Map";
import { ensureLeafletDefaultIcons } from "../../../components/map/leaflet-defaults";
import PropertyCard from "@/components/PropertyCard";
import PropertyDetailsModal from "@/components/PropertyDetailsModal";
import Filters from "@/components/Filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronDown, Filter, List, Map as MapIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapSearchProps {
  onSelectProperty?: (property: Property) => void;
}

interface MarkerData {
  marker: L.Marker;
  property: Property;
}

export default function MapSearch({ onSelectProperty }: MapSearchProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, MarkerData>>(new Map());

  const [listingType, setListingType] = useState<"sale" | "rent">("sale");
  const [filters, setFilters] = useState<Partial<SearchFilters>>({
    listingType: "sale",
  });
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [showPropertyModal, setShowPropertyModal] = useState(false);

  // Filter properties based on current filters
  const displayedProperties = useMemo(() => {
    return sampleProperties.filter((prop) => {
      if (prop.listingType !== listingType) return false;
      if (
        filters.minPrice !== undefined &&
        prop.price < filters.minPrice
      )
        return false;
      if (
        filters.maxPrice !== undefined &&
        prop.price > filters.maxPrice
      )
        return false;
      if (
        filters.minBedrooms !== undefined &&
        prop.bedrooms < filters.minBedrooms
      )
        return false;
      if (
        filters.maxBedrooms !== undefined &&
        prop.bedrooms > filters.maxBedrooms
      )
        return false;
      if (
        filters.minBathrooms !== undefined &&
        prop.bathrooms < filters.minBathrooms
      )
        return false;
      if (
        filters.maxBathrooms !== undefined &&
        prop.bathrooms > filters.maxBathrooms
      )
        return false;
      if (filters.furnished !== undefined && prop.furnished !== filters.furnished)
        return false;
      if (
        filters.petFriendly !== undefined &&
        prop.petFriendly !== filters.petFriendly
      )
        return false;
      if (
        searchQuery &&
        !prop.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !prop.address.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !prop.neighborhood.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [listingType, filters, searchQuery]);

  // Update markers when properties change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    ensureLeafletDefaultIcons();

    markersRef.current.forEach(({ marker }) => {
      marker.remove();
    });
    markersRef.current.clear();

    displayedProperties.forEach((property) => {
      try {
        const priceLabel = `₹${(property.price / 10000000).toFixed(1)}Cr`;
        const marker = L.marker([property.latitude, property.longitude], {
          title: property.title,
        }).addTo(map);

        const infoWindowContent = document.createElement("div");
        infoWindowContent.style.cssText = "padding: 12px; max-width: 280px; font-family: system-ui;";
        infoWindowContent.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <h3 style="font-weight: 600; font-size: 14px; margin: 0;">${property.title}</h3>
            <p style="font-size: 12px; color: #666; margin: 0;">${property.address}</p>
            <p style="font-weight: bold; font-size: 14px; margin: 0; color: #d97757;">${priceLabel}</p>
            <p style="font-size: 12px; color: #666; margin: 0;">${property.bedrooms} bed • ${property.bathrooms} bath • ${property.squareFeet} sqft</p>
            <button type="button" style="padding: 6px 12px; background: #d97757; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">View Details</button>
          </div>
        `;

        marker.bindPopup(infoWindowContent);
        marker.on("popupopen", () => {
          setSelectedProperty(property);
        });
        marker.on("click", () => {
          setSelectedProperty(property);
        });

        const detailsButton = infoWindowContent.querySelector("button");
        if (detailsButton) {
          detailsButton.addEventListener("click", () => {
            setSelectedProperty(property);
            onSelectProperty?.(property);
          });
        }

        markersRef.current.set(property.id, { marker, property });
      } catch (error) {
        console.error("Error creating marker:", error);
      }
    });
  }, [displayedProperties, onSelectProperty]);

  const handleSearch = (searchFilters: SearchFilters) => {
    setListingType(searchFilters.listingType);
    setFilters(searchFilters);
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleReset = () => {
    setFilters({ listingType });
    setSearchQuery("");
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    setShowPropertyModal(true);
    if (mapRef.current) {
      mapRef.current.setView([property.latitude, property.longitude], 16);
    }
    onSelectProperty?.(property);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-lg">Z</span>
            </div>
            <span className="font-bold text-xl text-primary">Zillow Kathmandu</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost">Buy</Button>
            <Button variant="ghost">Rent</Button>
            <Button variant="outline">Sign In</Button>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-64px)] gap-0">
        {/* Filters Panel */}
        {showFilters && (
          <div className="w-80 border-r border-border bg-card overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Search</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Search Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Location or Property</label>
                <Input
                  placeholder="Search location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Listing Type */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Type</label>
                <div className="flex gap-2">
                  <Button
                    variant={listingType === "sale" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setListingType("sale");
                      setFilters((prev) => ({ ...prev, listingType: "sale" }));
                    }}
                  >
                    Buy
                  </Button>
                  <Button
                    variant={listingType === "rent" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setListingType("rent");
                      setFilters((prev) => ({ ...prev, listingType: "rent" }));
                    }}
                  >
                    Rent
                  </Button>
                </div>
              </div>

              {/* Filters Component */}
              <Filters
                onFilterChange={handleFilterChange}
                onReset={handleReset}
              />
            </div>
          </div>
        )}

        {/* Map Container */}
        <div className="flex-1 relative">
          <MapView
            initialCenter={{ lat: 27.7172, lng: 85.324 }}
            initialZoom={13}
            onMapReady={(map) => {
              mapRef.current = map;
            }}
            className="h-full min-h-[400px] w-full"
          />

          {/* View Mode Toggle */}
          <div className="absolute bottom-6 left-6 flex gap-2 z-10">
            {!showFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(true)}
                className="lg:hidden"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            )}
            <Button
              variant={viewMode === "map" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("map")}
            >
              <MapIcon className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Results Count */}
          <div className="absolute top-6 right-6 bg-card px-4 py-2 rounded-lg shadow-sm border border-border z-10">
            <p className="text-sm font-medium">
              {displayedProperties.length} properties found
            </p>
          </div>

          {/* Property List Sheet (Mobile) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="absolute bottom-6 right-6 lg:hidden"
              >
                <List className="w-4 h-4 mr-2" />
                View List
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <div className="space-y-4 overflow-y-auto">
                <h2 className="font-semibold">Properties</h2>
                {displayedProperties.map((property) => (
                  <div
                    key={property.id}
                    onClick={() => handlePropertySelect(property)}
                    className="cursor-pointer"
                  >
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Property List (Desktop) */}
        {viewMode === "list" && (
          <div className="w-96 border-l border-border bg-card overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {displayedProperties.length} Properties
                </h2>
              </div>
              {displayedProperties.map((property) => (
                <div
                  key={property.id}
                  onClick={() => handlePropertySelect(property)}
                  className={cn(
                    "cursor-pointer p-3 rounded-lg border transition-colors",
                    selectedProperty?.id === property.id
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/50"
                  )}
                >
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Property Details Modal */}
      <PropertyDetailsModal
        property={selectedProperty}
        isOpen={showPropertyModal}
        onClose={() => setShowPropertyModal(false)}
      />
    </div>
  );
}
