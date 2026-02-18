/**
 * SearchBar Component
 * Main search interface for finding properties
 * Design: Modern Minimalist with Himalayan Warmth
 */

import { SearchFilters } from "@/../../shared/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  onSearch?: (filters: SearchFilters) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [listingType, setListingType] = useState<"sale" | "rent">("sale");
  const [propertyType, setPropertyType] = useState<string>("all");
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    const filters: SearchFilters = {
      listingType,
      propertyType: propertyType === "all" ? [] : [propertyType],
      minPrice: 0,
      maxPrice: 999999999,
      minBedrooms: 0,
      maxBedrooms: 10,
      minBathrooms: 0,
      maxBathrooms: 10,
      minSquareFeet: 0,
      maxSquareFeet: 999999,
      searchQuery: location,
    };
    onSearch?.(filters);
  };

  return (
    <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-border rounded-lg p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Listing Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            I want to
          </label>
          <Select value={listingType} onValueChange={(val: any) => setListingType(val)}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sale">Buy</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Property Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Property Type
          </label>
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="land">Land</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Location Search */}
        <div className="space-y-2 lg:col-span-2">
          <label className="text-sm font-medium text-foreground">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent pointer-events-none" />
            <Input
              placeholder="Enter location, neighborhood, or address"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10 bg-card border-border"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>
      </div>

      {/* Search Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSearch}
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium gap-2 px-8"
        >
          <Search className="w-4 h-4" />
          Search
        </Button>
      </div>
    </div>
  );
}
