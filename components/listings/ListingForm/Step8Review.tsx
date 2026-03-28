"use client";
import { useFormContext } from "react-hook-form";
import type { ListingFormData } from "@/lib/validations/listingSchema";
import { CheckCircle, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Props {
  images: { preview: string; isCover: boolean }[];
}

const AUTO_CHECKS = [
  { key: "title", label: "Title provided", check: (d: ListingFormData) => !!d.title },
  { key: "description", label: "Description ≥ 50 words", check: (d: ListingFormData) => (d.description?.split(/\s+/).filter(Boolean).length ?? 0) >= 50 },
  { key: "phone", label: "Phone number valid", check: (d: ListingFormData) => /^9[678]\d{8}$/.test(d.phone ?? "") },
  { key: "price", label: "Price within range", check: (d: ListingFormData) => (d.price ?? 0) >= 1000 && (d.price ?? 0) <= 500000 },
  { key: "images", label: "Minimum 3 images", check: (_: ListingFormData, imgs: number) => imgs >= 3 },
  { key: "neighborhood", label: "Neighborhood selected", check: (d: ListingFormData) => !!d.neighborhood_id },
  { key: "listing_type", label: "Property type selected", check: (d: ListingFormData) => !!d.listing_type },
];

export function Step8Review({ images }: Props) {
  const { watch } = useFormContext<ListingFormData>();
  const data = watch();

  const checks = AUTO_CHECKS.map((c) => ({
    ...c,
    passed: c.check(data, images.length),
  }));

  const allPassed = checks.every((c) => c.passed);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Review your listing</h2>
        <p className="text-muted-foreground mt-1">Check everything looks good before submitting for review.</p>
      </div>

      {/* Auto-verification checklist */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-4">Auto-verification Checklist</h3>
        <div className="space-y-2">
          {checks.map((c) => (
            <div key={c.key} className="flex items-center gap-3 text-sm">
              {c.passed
                ? <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                : <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />}
              <span className={c.passed ? "text-foreground" : "text-amber-700"}>{c.label}</span>
            </div>
          ))}
        </div>
        {allPassed ? (
          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700 font-medium">
            ✅ All checks passed! Your listing will be submitted for review.
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
            ⚠️ Please fix the items above before submitting.
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-4">Listing Summary</h3>
        {images[0] && (
          <img src={images.find(i => i.isCover)?.preview ?? images[0].preview} alt="Cover"
            className="w-full aspect-video object-cover rounded-xl mb-4" />
        )}
        <h4 className="font-bold text-lg">{data.title || "—"}</h4>
        <p className="text-accent font-semibold mt-1">{data.price ? formatPrice(data.price, "NPR", data.price_period) : "—"}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          {[
            ["Type", data.listing_type],
            ["Bedrooms", data.bedrooms],
            ["Bathrooms", data.bathrooms],
            ["Furnishing", data.furnishing],
            ["Neighborhood", data.neighborhood_id],
            ["Photos", `${images.length} uploaded`],
          ].map(([label, value]) => value != null && (
            <div key={String(label)} className="flex justify-between border-b border-border pb-1.5">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium capitalize">{String(value)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">📋 What happens next?</p>
        <ol className="list-decimal list-inside space-y-1 text-xs text-blue-700">
          <li>Your listing is submitted for moderator review</li>
          <li>Our team reviews it within 24 hours</li>
          <li>You receive a notification when it goes live</li>
          <li>Renters can find and contact you directly</li>
        </ol>
      </div>
    </div>
  );
}
