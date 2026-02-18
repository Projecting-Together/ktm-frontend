/**
 * PropertyDetails Page
 * Detailed view of a single property with images, description, and agent info
 * Design: Modern Minimalist with Himalayan Warmth
 */

import { Property } from "@/../../shared/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  User,
  Phone,
  Mail,
  Share2,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { useState } from "react";

interface PropertyDetailsProps {
  property: Property;
  onBack?: () => void;
}

export default function PropertyDetails({
  property,
  onBack,
}: PropertyDetailsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)}Cr`;
    }
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    }
    return `₹${price.toLocaleString()}`;
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 text-foreground hover:text-accent"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-border hover:bg-secondary/20"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFavorited(!isFavorited)}
              className={`border-border ${
                isFavorited
                  ? "bg-destructive/10 text-destructive"
                  : "hover:bg-secondary/20"
              }`}
            >
              <Heart
                className={`w-4 h-4 mr-2 ${isFavorited ? "fill-current" : ""}`}
              />
              {isFavorited ? "Saved" : "Save"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative rounded-lg overflow-hidden bg-muted h-96">
              <img
                src={property.images[currentImageIndex]}
                alt={`${property.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Image Navigation */}
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors shadow-lg"
                  >
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors shadow-lg"
                  >
                    <ChevronRight className="w-5 h-5 text-foreground" />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded text-sm font-medium">
                    {currentImageIndex + 1} / {property.images.length}
                  </div>
                </>
              )}

              {/* Image Thumbnails */}
              {property.images.length > 1 && (
                <div className="absolute bottom-4 left-4 flex gap-2">
                  {property.images.slice(0, 5).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-12 h-12 rounded border-2 transition-all ${
                        idx === currentImageIndex
                          ? "border-accent"
                          : "border-white/50 hover:border-white"
                      }`}
                    >
                      <img
                        src={property.images[idx]}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover rounded"
                      />
                    </button>
                  ))}
                  {property.images.length > 5 && (
                    <div className="w-12 h-12 rounded border-2 border-white/50 flex items-center justify-center bg-black/40 text-white text-xs font-medium">
                      +{property.images.length - 5}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Property Info */}
            <div className="space-y-4">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground">
                      {property.title}
                    </h1>
                    <div className="flex items-center gap-2 text-muted-foreground mt-2">
                      <MapPin className="w-4 h-4 text-accent" />
                      <span>{property.address}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-accent">
                      {formatPrice(property.price)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {property.listingType === "rent" ? "per month" : "asking price"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {property.isNewListing && (
                  <Badge className="bg-accent text-accent-foreground">
                    New Listing
                  </Badge>
                )}
                {property.isPriceReduced && (
                  <Badge className="bg-destructive text-destructive-foreground">
                    Price Reduced
                  </Badge>
                )}
                {property.isFeatured && (
                  <Badge className="bg-secondary text-secondary-foreground">
                    Featured
                  </Badge>
                )}
                <Badge variant="outline">
                  {property.propertyType.charAt(0).toUpperCase() +
                    property.propertyType.slice(1)}
                </Badge>
              </div>

              <Separator />

              {/* Key Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-secondary/10 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Bed className="w-4 h-4 text-accent" />
                    <span className="text-sm">Bedrooms</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {property.bedrooms}
                  </p>
                </div>

                <div className="bg-secondary/10 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Bath className="w-4 h-4 text-accent" />
                    <span className="text-sm">Bathrooms</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {property.bathrooms}
                  </p>
                </div>

                <div className="bg-secondary/10 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Square className="w-4 h-4 text-accent" />
                    <span className="text-sm">Square Feet</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {(property.squareFeet / 1000).toFixed(1)}k
                  </p>
                </div>

                <div className="bg-secondary/10 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 text-accent" />
                    <span className="text-sm">Days Listed</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {property.daysOnMarket}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-foreground">
                  About this property
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {property.description}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-foreground">Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-foreground"
                    >
                      <Check className="w-4 h-4 text-accent flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-foreground">
                  Property Details
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {property.yearBuilt && (
                    <div>
                      <p className="text-sm text-muted-foreground">Year Built</p>
                      <p className="text-foreground font-medium">
                        {property.yearBuilt}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Parking</p>
                    <p className="text-foreground font-medium">
                      {property.parking} space{property.parking !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Furnished</p>
                    <p className="text-foreground font-medium">
                      {property.furnished ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pet Friendly</p>
                    <p className="text-foreground font-medium">
                      {property.petFriendly ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Agent Card */}
            {property.agentName && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-bold text-foreground">
                  Contact Agent
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {property.agentName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Real Estate Agent
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  {property.agentPhone && (
                    <a
                      href={`tel:${property.agentPhone}`}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors text-foreground hover:text-accent"
                    >
                      <Phone className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {property.agentPhone}
                      </span>
                    </a>
                  )}

                  {property.agentEmail && (
                    <a
                      href={`mailto:${property.agentEmail}`}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors text-foreground hover:text-accent"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {property.agentEmail}
                      </span>
                    </a>
                  )}
                </div>

                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium">
                  Schedule Tour
                </Button>
              </div>
            )}

            {/* Price per Sqft */}
            {property.pricePerSqft && (
              <div className="bg-secondary/10 rounded-lg p-6 space-y-2">
                <p className="text-sm text-muted-foreground">Price per Sq. Ft.</p>
                <p className="text-2xl font-bold text-foreground">
                  ₹{property.pricePerSqft.toLocaleString()}
                </p>
              </div>
            )}

            {/* Listing Info */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-3">
              <h3 className="font-bold text-foreground">Listing Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Listed on</span>
                  <span className="text-foreground font-medium">
                    {new Date(property.listedDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Days on market</span>
                  <span className="text-foreground font-medium">
                    {property.daysOnMarket}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property type</span>
                  <span className="text-foreground font-medium capitalize">
                    {property.propertyType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Listing type</span>
                  <span className="text-foreground font-medium capitalize">
                    {property.listingType === "sale" ? "For Sale" : "For Rent"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
