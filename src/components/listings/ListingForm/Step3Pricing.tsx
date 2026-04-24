"use client";
import { useFormContext } from "react-hook-form";
import type { ListingFormData } from "@/lib/validations/listingSchema";

const PRICE_PERIODS = [
  { value: "month", label: "Per Month" },
  { value: "year", label: "Per Year" },
  { value: "day", label: "Per Day" },
];

export function Step3Pricing() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<ListingFormData>();
  const period = watch("price_period");
  const negotiable = watch("price_negotiable");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Set your price</h2>
        <p className="text-muted-foreground mt-1">Competitive pricing gets more inquiries.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Rent Amount (NPR) *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">NPR</span>
            <input {...register("price", { valueAsNumber: true })} type="number" placeholder="e.g. 25000"
              className="h-11 w-full rounded-lg border border-border bg-background pl-12 pr-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
          {errors.price && <p className="mt-1 text-xs text-destructive">{errors.price.message}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Price Period *</label>
          <select {...register("price_period")}
            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent">
            {PRICE_PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Security Deposit (NPR)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">NPR</span>
            <input {...register("security_deposit", { valueAsNumber: true })} type="number" placeholder="e.g. 50000"
              className="h-11 w-full rounded-lg border border-border bg-background pl-12 pr-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Available From</label>
          <input {...register("available_from")} type="date"
            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
        <input {...register("price_negotiable")} type="checkbox" id="negotiable" className="h-4 w-4 rounded border-border accent-accent" />
        <div>
          <label htmlFor="negotiable" className="text-sm font-medium cursor-pointer">Price is negotiable</label>
          <p className="text-xs text-muted-foreground">Renters will know they can discuss the price with you.</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted p-4 text-sm text-foreground">
        <p className="font-semibold mb-1">💡 Pricing Tips for Kathmandu</p>
        <ul className="space-y-1 text-xs list-disc list-inside text-muted-foreground">
          <li>Thamel 1BR: NPR 15,000–25,000/month</li>
          <li>Lazimpat 2BR: NPR 25,000–45,000/month</li>
          <li>Patan 2BR: NPR 20,000–35,000/month</li>
          <li>Koteshwor 1BR: NPR 10,000–18,000/month</li>
        </ul>
      </div>
    </div>
  );
}
