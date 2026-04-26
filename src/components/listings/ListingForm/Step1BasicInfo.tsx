"use client";
import { useFormContext } from "react-hook-form";
import type { ListingFormData } from "@/lib/validations/listingSchema";

const LISTING_TYPES = [
  { value: "apartment", label: "Apartment", desc: "Unit in a multi-story building" },
  { value: "room", label: "Room", desc: "Single room in a shared house" },
  { value: "house", label: "House", desc: "Full standalone house" },
  { value: "studio", label: "Studio", desc: "Open-plan studio apartment" },
  { value: "penthouse", label: "Penthouse", desc: "Top-floor luxury unit" },
  { value: "commercial", label: "Commercial", desc: "Office or commercial space" },
  { value: "land", label: "Land", desc: "Empty plot for development or resale" },
  { value: "video_shooting", label: "Video Shooting", desc: "Property listed as a shoot location" },
];

const PURPOSE_OPTIONS = [
  { value: "rent", label: "For Rent", hint: "Monthly recurring pricing" },
  { value: "sale", label: "For Sale", hint: "One-time sale price" },
] as const;

export function Step1BasicInfo() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<ListingFormData>();
  const selectedType = watch("listing_type");
  const selectedPurpose = watch("purpose");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">What are you listing?</h2>
        <p className="text-muted-foreground mt-1">Choose the type of property you want to list.</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Listing Purpose *</label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PURPOSE_OPTIONS.map((option) => {
            const isSelected = selectedPurpose === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setValue("purpose", option.value, { shouldValidate: true })}
                className={`rounded-xl border p-4 text-left transition-all ${
                  isSelected
                    ? "border-accent bg-accent/10 ring-1 ring-accent"
                    : "border-border hover:border-accent/50"
                }`}
              >
                <p className="text-sm font-semibold">{option.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{option.hint}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Property Type *</label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {LISTING_TYPES.map((t) => (
            <button key={t.value} type="button"
              onClick={() => setValue("listing_type", t.value as never, { shouldValidate: true })}
              className={`rounded-xl border p-4 text-left transition-all ${
                selectedType === t.value
                  ? "border-accent bg-accent/10 ring-1 ring-accent"
                  : "border-border hover:border-accent/50"
              }`}>
              <p className="text-sm font-semibold">{t.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t.desc}</p>
            </button>
          ))}
        </div>
        {errors.listing_type && <p className="mt-1 text-xs text-destructive">{errors.listing_type.message}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Listing Title *</label>
        <input {...register("title")} placeholder="e.g. Bright 2-Bedroom Apartment in Thamel"
          className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
        {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
        <p className="mt-1 text-xs text-muted-foreground">A clear, descriptive title helps renters find your listing.</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Description *</label>
        <textarea {...register("description")} rows={5}
          placeholder="Describe your property — location highlights, nearby amenities, house rules, and what makes it special..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none" />
        {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
        <p className="mt-1 text-xs text-muted-foreground">Minimum 50 words required for auto-verification.</p>
      </div>
    </div>
  );
}
