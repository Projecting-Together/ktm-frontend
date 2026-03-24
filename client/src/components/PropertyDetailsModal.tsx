/*
 * PropertyDetailsModal Component
 * Full property details modal with images, amenities, and contact info
 * Design: Modern Minimalist with Himalayan Warmth
 */

import { Property } from "@/../../shared/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Bed,
  Bath,
  Ruler,
  Heart,
  Share2,
  Phone,
  Mail,
  X,
} from "lucide-react";
import { useState } from "react";

interface PropertyDetailsModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PropertyDetailsModal({
  property,
  isOpen,
  onClose,
}: PropertyDetailsModalProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  if (!property) return null;

  const priceDisplay = property.listingType === "rent"
    ? `₹${property.price.toLocaleString()}/month`
    : `₹${(property.price / 10000000).toFixed(1)}Cr`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative pb-4 border-b">
          <DialogTitle className="text-2xl font-bold">
            {property.title}
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4" />
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Section */}
          <div className="relative w-full h-80 bg-muted rounded-lg overflow-hidden">
            <img
              src={property.images && property.images.length > 0 ? property.images[0] : 'https://via.placeholder.com/600x400'}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-white/90 hover:bg-white"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFavorite ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-white/90 hover:bg-white"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Price and Location */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-accent">
                {priceDisplay}
              </div>
              <span className="text-sm text-muted-foreground">
                {property.listingType === "rent" ? "per month" : "asking price"}
              </span>
            </div>
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">{property.address}</p>
                <p className="text-sm">{property.neighborhood}</p>
              </div>
            </div>
          </div>

          {/* Property Details Grid */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Bed className="w-5 h-5 text-accent" />
              </div>
              <p className="text-sm font-medium">{property.bedrooms}</p>
              <p className="text-xs text-muted-foreground">Bedrooms</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Bath className="w-5 h-5 text-accent" />
              </div>
              <p className="text-sm font-medium">{property.bathrooms}</p>
              <p className="text-xs text-muted-foreground">Bathrooms</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Ruler className="w-5 h-5 text-accent" />
              </div>
              <p className="text-sm font-medium">{property.squareFeet}</p>
              <p className="text-xs text-muted-foreground">Sq Ft</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">About this property</h3>
            <p className="text-muted-foreground leading-relaxed">
              {property.description ||
                "This is a wonderful property in a prime location. Perfect for families or investors looking for a great opportunity in Kathmandu."}
            </p>
          </div>

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Features</h3>
              <div className="grid grid-cols-2 gap-2">
                {property.features.map((feature: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Section */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold text-lg">Contact Agent</h3>
            <div className="flex gap-3">
              <Button className="flex-1 gap-2 bg-accent hover:bg-accent/90">
                <Phone className="w-4 h-4" />
                Call Agent
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2"
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
            </div>
          </div>

          {/* Schedule Tour */}
          <Button className="w-full bg-primary hover:bg-primary/90 text-lg py-6">
            Schedule a Tour
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
