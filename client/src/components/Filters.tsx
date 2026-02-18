/**
 * Filters Component
 * Sidebar filters for refining property search
 * Design: Modern Minimalist with Himalayan Warmth
 */

import { SearchFilters } from "@/../../shared/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, X } from "lucide-react";
import { useState } from "react";

interface FiltersProps {
  onFilterChange?: (filters: Partial<SearchFilters>) => void;
  onReset?: () => void;
}

export default function Filters({ onFilterChange, onReset }: FiltersProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "price",
    "bedrooms",
  ]);
  const [priceRange, setPriceRange] = useState([0, 100000000]);
  const [bedroomRange, setBedroomRange] = useState([0, 5]);
  const [bathroomRange, setBathroomRange] = useState([0, 5]);
  const [furnished, setFurnished] = useState(false);
  const [petFriendly, setPetFriendly] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handleFilterChange = () => {
    onFilterChange?.({
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      minBedrooms: bedroomRange[0],
      maxBedrooms: bedroomRange[1],
      minBathrooms: bathroomRange[0],
      maxBathrooms: bathroomRange[1],
      furnished,
      petFriendly,
    });
  };

  const handleReset = () => {
    setPriceRange([0, 100000000]);
    setBedroomRange([0, 5]);
    setBathroomRange([0, 5]);
    setFurnished(false);
    setPetFriendly(false);
    onReset?.();
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(0)}Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(0)}L`;
    return `₹${price}`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full py-2 hover:text-accent transition-colors"
        >
          <span className="font-medium text-foreground">Price Range</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedSections.includes("price") ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.includes("price") && (
          <div className="space-y-3 pt-3">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              min={0}
              max={100000000}
              step={1000000}
              className="w-full"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Min</Label>
                <p className="text-sm font-medium">{formatPrice(priceRange[0])}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Max</Label>
                <p className="text-sm font-medium">{formatPrice(priceRange[1])}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Bedrooms */}
      <div>
        <button
          onClick={() => toggleSection("bedrooms")}
          className="flex items-center justify-between w-full py-2 hover:text-accent transition-colors"
        >
          <span className="font-medium text-foreground">Bedrooms</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedSections.includes("bedrooms") ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.includes("bedrooms") && (
          <div className="space-y-3 pt-3">
            <Slider
              value={bedroomRange}
              onValueChange={setBedroomRange}
              min={0}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Min</Label>
                <p className="text-sm font-medium">{bedroomRange[0]}+</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Max</Label>
                <p className="text-sm font-medium">{bedroomRange[1]}+</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Bathrooms */}
      <div>
        <button
          onClick={() => toggleSection("bathrooms")}
          className="flex items-center justify-between w-full py-2 hover:text-accent transition-colors"
        >
          <span className="font-medium text-foreground">Bathrooms</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedSections.includes("bathrooms") ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.includes("bathrooms") && (
          <div className="space-y-3 pt-3">
            <Slider
              value={bathroomRange}
              onValueChange={setBathroomRange}
              min={0}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Min</Label>
                <p className="text-sm font-medium">{bathroomRange[0]}+</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Max</Label>
                <p className="text-sm font-medium">{bathroomRange[1]}+</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Amenities */}
      <div>
        <button
          onClick={() => toggleSection("amenities")}
          className="flex items-center justify-between w-full py-2 hover:text-accent transition-colors"
        >
          <span className="font-medium text-foreground">Amenities</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedSections.includes("amenities") ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.includes("amenities") && (
          <div className="space-y-3 pt-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="furnished"
                checked={furnished}
                onCheckedChange={(checked) => {
                  setFurnished(checked as boolean);
                  handleFilterChange();
                }}
              />
              <Label
                htmlFor="furnished"
                className="text-sm font-medium cursor-pointer"
              >
                Furnished
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pet-friendly"
                checked={petFriendly}
                onCheckedChange={(checked) => {
                  setPetFriendly(checked as boolean);
                  handleFilterChange();
                }}
              />
              <Label
                htmlFor="pet-friendly"
                className="text-sm font-medium cursor-pointer"
              >
                Pet Friendly
              </Label>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Apply Button */}
      <Button
        onClick={handleFilterChange}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
      >
        Apply Filters
      </Button>
    </div>
  );
}
