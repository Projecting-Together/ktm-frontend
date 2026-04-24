"use client";

import Link from "next/link";
import { useState } from "react";
import {
  MapPin, Bed, Bath, Square, Calendar, Phone, MessageCircle,
  Heart, Share2, Flag, ChevronLeft, ChevronRight, ShieldCheck,
  Wifi, Car, Zap, Droplets
} from "lucide-react";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { ListingCoverImage } from "@/components/listings/ListingCoverImage";
import { useToggleFavorite, useIsFavorite } from "@/lib/hooks/useFavorites";
import { ListingCard } from "@/components/listings/ListingCard";
import { useListing, useListings } from "@/lib/hooks/useListings";
import { useAuthStore } from "@/lib/stores/authStore";
import { trackInquiryCtaClick } from "@/lib/analytics/events";
import { formatPrice, formatDate, buildWhatsAppUrl, cn, getStatusColor } from "@/lib/utils";
import type { Listing } from "@/lib/api/types";

interface Props {
  listing?: Listing;
  slugOrId?: string;
}

export default function ListingDetailClient({ listing: initialListing, slugOrId }: Props) {
  const { data: fetchedListing, isLoading, isError } = useListing(slugOrId ?? "", {
    enabled: !initialListing && !!slugOrId,
  });
  const listing = initialListing ?? fetchedListing;
  const listingPurpose = listing?.purpose === "sale" ? "sale" : "rent";
  const relatedListingsQuery = useListings({ purpose: listingPurpose, limit: 4 });
  const [activeImg, setActiveImg] = useState(0);
  const { isAuthenticated } = useAuthStore();
  const isFavorite = useIsFavorite(listing?.id ?? "");
  const { mutate: toggleFavorite } = useToggleFavorite();

  if (!listing) {
    if (isLoading) {
      return (
        <div className="container py-10">
          <p className="text-sm text-muted-foreground">Loading property details...</p>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="container py-10">
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
            Couldn&apos;t load this property. It may have been removed or is unavailable right now.
          </div>
        </div>
      );
    }
  }

  if (!listing) return null;

  const images = listing.images ?? [];
  const coverImg =
    images.length > 0
      ? images[activeImg]?.webp_url ?? images[activeImg]?.image_url ?? null
      : null;

  const whatsappUrl = listing.owner?.whatsapp_number
    ? buildWhatsAppUrl(listing.owner.whatsapp_number, `Hi, I am interested in: ${listing.title} - ktmapartments.com/apartments/${listing.slug}`)
    : null;
  const inquiryCtaText = listing.purpose === "sale" ? "Send Inquiry to Seller" : "Send Inquiry";
  const apartmentsHref = listing.purpose === "sale" ? "/apartments?purpose=sale" : "/apartments";
  const relatedListings =
    relatedListingsQuery.data?.items?.filter((candidate) => candidate.id !== listing.id).slice(0, 3) ?? [];
  const relatedSectionTitle = listingPurpose === "sale" ? "Related Sale Listings" : "Related Rent Listings";

  return (
    <div className="container py-6 lg:py-10">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-accent">Home</Link>
        <span>/</span>
        <Link href={apartmentsHref} className="hover:text-accent">Apartments</Link>
        <span>/</span>
        <span className="text-foreground line-clamp-1">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2">
          {/* Image gallery */}
          <div className="relative overflow-hidden rounded-2xl bg-muted">
            <div className="relative aspect-[16/10]">
              <ListingCoverImage
                src={coverImg}
                alt={listing.title}
                fill
                compact={false}
                imgClassName="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
              {listing.is_verified && <div className="absolute left-4 top-4"><VerifiedBadge size="md" /></div>}
              {listing.status !== "active" && (
                <div className="absolute right-4 top-4">
                  <span className={cn("rounded-full px-3 py-1 text-xs font-semibold capitalize", getStatusColor(listing.status))}>{listing.status}</span>
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImg((p) => (p - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={() => setActiveImg((p) => (p + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white">
                    {activeImg + 1} / {images.length}
                  </span>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {images.map((img, i) => (
                  <button key={img.id} onClick={() => setActiveImg(i)}
                    className={cn("relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                      i === activeImg ? "border-accent" : "border-transparent opacity-60 hover:opacity-100")}>
                    <ListingCoverImage
                      src={img.webp_url ?? img.image_url ?? null}
                      alt=""
                      fill
                      imgClassName="object-cover"
                      sizes="96px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & meta */}
          <div className="mt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold leading-tight">{listing.title}</h1>
                <p className="mt-1.5 flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0 text-accent" />
                  {listing.location?.neighborhood?.name && <span>{listing.location.neighborhood.name}, </span>}
                  {listing.location?.city ?? "Kathmandu"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => isAuthenticated ? toggleFavorite(listing.id) : (window.location.href = "/login")}
                  className={cn("flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:border-accent",
                    isFavorite && "border-accent bg-accent/10")}>
                  <Heart className={cn("h-4 w-4", isFavorite && "fill-accent text-accent")} />
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:border-accent">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Key stats */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {listing.bedrooms != null && (
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
                  <Bed className="h-5 w-5 text-accent" />
                  <div><p className="text-xs text-muted-foreground">Bedrooms</p><p className="font-semibold">{listing.bedrooms}</p></div>
                </div>
              )}
              {listing.bathrooms != null && (
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
                  <Bath className="h-5 w-5 text-accent" />
                  <div><p className="text-xs text-muted-foreground">Bathrooms</p><p className="font-semibold">{listing.bathrooms}</p></div>
                </div>
              )}
              {listing.area_sqft != null && (
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
                  <Square className="h-5 w-5 text-accent" />
                  <div><p className="text-xs text-muted-foreground">Area</p><p className="font-semibold">{listing.area_sqft} sqft</p></div>
                </div>
              )}
              {listing.available_from && (
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
                  <Calendar className="h-5 w-5 text-accent" />
                  <div><p className="text-xs text-muted-foreground">Available</p><p className="font-semibold text-sm">{formatDate(listing.available_from)}</p></div>
                </div>
              )}
            </div>

            {/* Description */}
            {listing.description && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold">About this property</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{listing.description}</p>
              </div>
            )}

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold">Amenities</h2>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {listing.amenities.map((a) => (
                    <div key={a.id} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
                      {a.icon && <span>{a.icon}</span>}
                      <span>{a.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Details table */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold">Property Details</h2>
              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {[
                  ["Type", listing.listing_type],
                  ["Furnishing", listing.furnishing],
                  ["Floor", listing.floor != null ? `${listing.floor}${listing.total_floors ? ` of ${listing.total_floors}` : ""}` : null],
                  ["Parking", listing.parking ? "Available" : "Not available"],
                  ["Pets", listing.pets_allowed ? "Allowed" : "Not allowed"],
                  ["Smoking", listing.smoking_allowed ? "Allowed" : "Not allowed"],
                  ["Listed", formatDate(listing.created_at)],
                ].filter(([, v]) => v != null).map(([label, value]) => (
                  <div key={label as string} className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium capitalize">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right column — price & contact */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            {/* Price card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="price text-3xl font-bold text-accent">
                {formatPrice(listing.price, listing.currency, listing.price_period)}
              </p>
              {listing.price_negotiable && (
                <p className="mt-1 text-xs text-muted-foreground">Price is negotiable</p>
              )}
              {listing.security_deposit && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Security deposit: {formatPrice(listing.security_deposit, listing.currency)}
                </p>
              )}

              <div className="mt-5 flex flex-col gap-2">
                <Link href={isAuthenticated ? `#inquiry` : "/login"}
                  onClick={() => {
                    if (!isAuthenticated) return;
                    trackInquiryCtaClick({
                      listingId: listing.id,
                      purpose: listing.purpose === "sale" ? "sale" : "rent",
                      source: "listing_detail_cta",
                    });
                  }}
                  className="btn-primary w-full justify-center gap-2">
                  <MessageCircle className="h-4 w-4" /> {inquiryCtaText}
                </Link>
                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-verified/40 bg-verified/10 px-4 py-2.5 text-sm font-semibold text-verified transition-colors hover:bg-verified/20">
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                )}
                <Link href={isAuthenticated ? `#visit` : "/login"}
                  className="btn-secondary w-full justify-center gap-2">
                  <Calendar className="h-4 w-4" /> Schedule Visit
                </Link>
              </div>
            </div>

            {/* Owner card */}
            {listing.owner && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold">Listed by</h3>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {listing.owner.first_name?.[0] ?? listing.owner.email?.[0]?.toUpperCase() ?? "O"}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {listing.owner.first_name
                        ? `${listing.owner.first_name} ${listing.owner.last_name ?? ""}`
                        : listing.owner.email}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{listing.owner.role}</p>
                  </div>
                  {listing.owner.is_verified && <ShieldCheck className="ml-auto h-4 w-4 text-verified" />}
                </div>
              </div>
            )}

            {/* Safety tip */}
            <div className="rounded-xl border border-border bg-muted p-4 text-xs text-foreground">
              <p className="font-semibold mb-1">Safety Tip</p>
              <p>Never pay before visiting the property. Meet in person and verify ownership documents before making any payment.</p>
            </div>

            <button className="flex w-full items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-destructive">
              <Flag className="h-3.5 w-3.5" /> Report this listing
            </button>
          </div>
        </div>
      </div>

      {relatedListings.length > 0 && (
        <section className="mt-10 border-t border-border pt-8">
          <h2 className="text-xl font-semibold">{relatedSectionTitle}</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedListings.map((relatedListing) => (
              <ListingCard key={relatedListing.id} listing={relatedListing} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
