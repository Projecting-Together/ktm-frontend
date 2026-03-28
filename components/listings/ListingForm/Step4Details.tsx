"use client";
import { useFormContext } from "react-hook-form";
import type { ListingFormData } from "@/lib/validations/listingSchema";

const FURNISHING_OPTIONS = [
  { value: "unfurnished", label: "Unfurnished", desc: "Empty space, no furniture" },
  { value: "semi_furnished", label: "Semi-furnished", desc: "Basic furniture included" },
  { value: "fully_furnished", label: "Fully furnished", desc: "All furniture & appliances" },
];

export function Step4Details() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<ListingFormData>();
  const furnishing = watch("furnishing");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Property details</h2>
        <p className="text-muted-foreground mt-1">Help renters understand the property better.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Bedrooms *</label>
          <select {...register("bedrooms", { valueAsNumber: true })}
            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-accent focus:outline-none">
            {[0,1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n === 0 ? "Studio" : n}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Bathrooms *</label>
          <select {...register("bathrooms", { valueAsNumber: true })}
            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-accent focus:outline-none">
            {[1,2,3,4].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Floor</label>
          <input {...register("floor", { valueAsNumber: true })} type="number" placeholder="e.g. 3"
            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-accent focus:outline-none" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Total Floors</label>
          <input {...register("total_floors", { valueAsNumber: true })} type="number" placeholder="e.g. 5"
            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-accent focus:outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Area (sqft)</label>
          <input {...register("area_sqft", { valueAsNumber: true })} type="number" placeholder="e.g. 850"
            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-accent focus:outline-none" />
        </div>
        
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Furnishing *</label>
        <div className="grid grid-cols-3 gap-3">
          {FURNISHING_OPTIONS.map((f) => (
            <button key={f.value} type="button"
              onClick={() => setValue("furnishing", f.value as never, { shouldValidate: true })}
              className={`rounded-xl border p-4 text-left transition-all ${
                furnishing === f.value ? "border-accent bg-accent/10 ring-1 ring-accent" : "border-border hover:border-accent/50"
              }`}>
              <p className="text-sm font-semibold">{f.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
            </button>
          ))}
        </div>
        {errors.furnishing && <p className="mt-1 text-xs text-destructive">{errors.furnishing.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { name: "parking", label: "Parking available" },
          { name: "pets_allowed", label: "Pets allowed" },
          { name: "smoking_allowed", label: "Smoking allowed" },
        ].map((item) => (
          <div key={item.name} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <input {...register(item.name as never)} type="checkbox" id={item.name} className="h-4 w-4 rounded border-border accent-accent" />
            <label htmlFor={item.name} className="text-sm font-medium cursor-pointer">{item.label}</label>
          </div>
        ))}
      </div>
    </div>
  );
}
