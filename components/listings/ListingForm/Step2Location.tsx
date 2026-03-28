"use client";

import { useFormContext } from "react-hook-form";
import { MapPin } from "lucide-react";
import type { ListingFormData } from "@/lib/validations/listingSchema";

const KTM_NEIGHBORHOODS = [
  { id: "thamel", name: "Thamel", name_ne: "थमेल", emoji: "🏙️" },
  { id: "lazimpat", name: "Lazimpat", name_ne: "लाजिम्पाट", emoji: "🌿" },
  { id: "patan", name: "Patan", name_ne: "पाटन", emoji: "🏛️" },
  { id: "bhaktapur", name: "Bhaktapur", name_ne: "भक्तपुर", emoji: "⛩️" },
  { id: "koteshwor", name: "Koteshwor", name_ne: "कोटेश्वर", emoji: "🏘️" },
  { id: "baneshwor", name: "Baneshwor", name_ne: "बानेश्वर", emoji: "🏢" },
  { id: "baluwatar", name: "Baluwatar", name_ne: "बालुवाटार", emoji: "🌳" },
  { id: "maharajgunj", name: "Maharajgunj", name_ne: "महाराजगंज", emoji: "🏡" },
];

export function Step2Location() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<ListingFormData>();
  const selectedNeighborhood = watch("neighborhood_id");

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium">Neighborhood *</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {KTM_NEIGHBORHOODS.map((n) => {
            const isSelected = selectedNeighborhood === n.id;
            return (
            <button key={n.id} type="button"
              onClick={() => setValue("neighborhood_id", n.id, { shouldValidate: true })}
              className={"rounded-xl border p-3 text-left transition-all " + (isSelected ? "border-accent bg-accent/10 ring-1 ring-accent" : "border-border hover:border-accent/50")}>
              <span className="text-xl">{n.emoji}</span>
              <p className="mt-1 text-sm font-semibold">{n.name}</p>
              <p className="text-xs text-muted-foreground">{n.name_ne}</p>
            </button>
            );
          })}
        </div>
        {errors.neighborhood_id && <p className="mt-1 text-xs text-destructive">{errors.neighborhood_id.message}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Street Address *</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input {...register("address_line")} placeholder="e.g. Thamel Marg, near Kathmandu Guest House"
            className="h-11 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
        </div>
        {errors.address_line && <p className="mt-1 text-xs text-destructive">{errors.address_line.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Floor Number</label>
          <input {...register("floor", { valueAsNumber: true })} type="number" min="-5" max="100" placeholder="e.g. 3"
            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          {errors.floor && <p className="mt-1 text-xs text-destructive">{errors.floor.message}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Total Floors in Building</label>
          <input {...register("total_floors", { valueAsNumber: true })} type="number" min="1" max="100" placeholder="e.g. 8"
            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          {errors.total_floors && <p className="mt-1 text-xs text-destructive">{errors.total_floors.message}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Area (sq ft)</label>
        <input {...register("area_sqft", { valueAsNumber: true })} type="number" min="1" max="50000" placeholder="e.g. 850"
          className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
        {errors.area_sqft && <p className="mt-1 text-xs text-destructive">{errors.area_sqft.message}</p>}
      </div>
    </div>
  );
}
