"use client";
import { useFormContext } from "react-hook-form";
import type { ListingFormData } from "@/lib/validations/listingSchema";
import { Phone, MessageCircle } from "lucide-react";

export function Step7Contact() {
  const { register, watch, formState: { errors } } = useFormContext<ListingFormData>();
  const showPhone = watch("show_phone");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Contact information</h2>
        <p className="text-muted-foreground mt-1">How should renters reach you?</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Phone Number *</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">+977</span>
          <input {...register("phone")} type="tel" placeholder="98XXXXXXXX"
            className="h-11 w-full rounded-lg border border-border bg-background pl-14 pr-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
        </div>
        {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
        <p className="mt-1 text-xs text-muted-foreground">Your phone number is encrypted and only shared with verified renters.</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">WhatsApp Number (optional)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">+977</span>
          <input {...register("whatsapp")} type="tel" placeholder="98XXXXXXXX"
            className="h-11 w-full rounded-lg border border-border bg-background pl-14 pr-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Enables WhatsApp contact button on your listing. Leave blank to use the same as phone.</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <input {...register("show_phone")} type="checkbox" id="show_phone" className="h-4 w-4 rounded border-border accent-accent" />
          <div>
            <label htmlFor="show_phone" className="text-sm font-medium cursor-pointer flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-accent" /> Show phone number on listing
            </label>
            <p className="text-xs text-muted-foreground">Renters can see and call your number directly.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <input {...register("show_email")} type="checkbox" id="show_email" defaultChecked className="h-4 w-4 rounded border-border accent-accent" />
          <div>
            <label htmlFor="show_email" className="text-sm font-medium cursor-pointer flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4 text-accent" /> Allow in-app inquiries
            </label>
            <p className="text-xs text-muted-foreground">Renters can send you messages through KTM Apartments.</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted p-4 text-sm text-foreground">
        <p className="font-semibold mb-1">🔒 Privacy Protection</p>
        <p className="text-xs text-muted-foreground">Phone numbers are masked for unauthenticated users. Only verified renters can see your full contact details.</p>
      </div>
    </div>
  );
}
