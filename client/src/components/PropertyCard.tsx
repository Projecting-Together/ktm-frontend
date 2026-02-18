/**
 * PropertyCard Component
 * Displays a single property listing with image, details, and action buttons
 * Design: Modern Minimalist with Himalayan Warmth
 */

import { Property } from "@/../../shared/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MapPin,
  Bed,
  Bath,
  Square,
  TrendingDown,
  Zap,
} from "lucide-react";
import { useState } from "react";

interface PropertyCardProps {
  property: Property;
  onViewDetails?: (id: string) => void;
}

export default function PropertyCard({
  property,
  onViewDetails,
}: PropertyCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)}Cr`;
    }
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    }
    return `₹${price.toLocaleString()}`;
  };

  const priceLabel =
    property.listingType === "rent" ? "per month" : "asking price";

  return (
    <div className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border border-border">
      {/* Image Container */}
      <div className="relative overflow-hidden bg-muted h-64">
        {!imageError ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20">
            <span className="text-muted-foreground text-sm">
              Image unavailable
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          {property.isNewListing && (
            <Badge className="bg-accent text-accent-foreground">New</Badge>
          )}
          {property.isPriceReduced && (
            <Badge className="bg-destructive text-destructive-foreground flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              Price Reduced
            </Badge>
          )}
          {property.isFeatured && (
            <Badge className="bg-secondary text-secondary-foreground flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Featured
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorited(!isFavorited)}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isFavorited ? "fill-destructive text-destructive" : "text-muted-foreground"
            }`}
          />
        </button>

        {/* Days on Market */}
        <div className="absolute bottom-3 right-3 bg-primary/90 text-primary-foreground px-3 py-1 rounded text-xs font-medium">
          {property.daysOnMarket} days
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Price */}
        <div>
          <p className="text-2xl font-bold text-primary">
            {formatPrice(property.price)}
          </p>
          <p className="text-xs text-muted-foreground">{priceLabel}</p>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-foreground line-clamp-2 hover:text-accent transition-colors">
          {property.title}
        </h3>

        {/* Address */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent" />
          <span className="line-clamp-1">{property.address}</span>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-border">
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">{property.bedrooms}</span>
            <span className="text-xs text-muted-foreground">bed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">{property.bathrooms}</span>
            <span className="text-xs text-muted-foreground">bath</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Square className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">
              {(property.squareFeet / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-muted-foreground">sqft</span>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1">
          {property.features.slice(0, 2).map((feature, idx) => (
            <span
              key={idx}
              className="text-xs bg-secondary/50 text-secondary-foreground px-2 py-1 rounded"
            >
              {feature}
            </span>
          ))}
          {property.features.length > 2 && (
            <span className="text-xs text-muted-foreground px-2 py-1">
              +{property.features.length - 2} more
            </span>
          )}
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => onViewDetails?.(property.id)}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
