import { z } from "zod";

// ─── Auth schemas ─────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string(),
  role: z.enum(["renter", "owner", "agent"]),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// ─── Nepal phone validation ───────────────────────────────────────────────────
const nepalPhoneRegex = /^(\+977)?[0-9]{9,10}$/;
const nepalPhoneSchema = z
  .string()
  .regex(nepalPhoneRegex, "Enter a valid Nepal phone number (e.g. 9841234567)");

// ─── Listing creation — Step 1: Property Basics ───────────────────────────────
export const step1Schema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(120, "Title too long"),
  listing_type: z.enum(["apartment", "room", "house", "studio", "commercial"]),
  purpose: z.enum(["rent", "sale"]).default("rent"),
  address_line: z.string().min(5, "Enter a valid address"),
  neighborhood_id: z.string().uuid("Select a neighborhood"),
  floor: z.number().int().min(-5).max(100).optional().nullable(),
  total_floors: z.number().int().min(1).max(100).optional().nullable(),
  area_sqft: z.number().positive("Enter a valid area").max(50000).optional().nullable(),
});

// ─── Step 2: Details ──────────────────────────────────────────────────────────
export const step2Schema = z.object({
  bedrooms: z.number().int().min(0).max(20).optional().nullable(),
  bathrooms: z.number().min(0).max(20).optional().nullable(),
  furnishing: z.enum(["fully", "semi", "unfurnished"]).optional(),
  parking: z.boolean().default(false),
  pets_allowed: z.boolean().default(false),
  smoking_allowed: z.boolean().default(false),
  available_from: z.string().optional().nullable(),
});

// ─── Step 3: Amenities ────────────────────────────────────────────────────────
export const step3Schema = z.object({
  amenity_ids: z.array(z.string().uuid()).default([]),
});

// ─── Step 4: Pricing ──────────────────────────────────────────────────────────
export const step4Schema = z.object({
  price: z
    .number()
    .positive("Enter a valid price")
    .max(5_000_000, "Price seems too high — check the value")
    .min(1_000, "Minimum price is NPR 1,000"),
  price_period: z.enum(["monthly", "yearly", "daily"]).default("monthly"),
  currency: z.string().default("NPR"),
  security_deposit: z.number().min(0).optional().nullable(),
  price_negotiable: z.boolean().default(false),
});

// ─── Step 5: Media Upload ─────────────────────────────────────────────────────
export const step5Schema = z.object({
  images: z
    .array(
      z.object({
        id: z.string(),
        url: z.string().url(),
        storage_key: z.string(),
        is_cover: z.boolean().default(false),
        sort_order: z.number().int(),
      })
    )
    .min(3, "Upload at least 3 photos")
    .max(20, "Maximum 20 photos allowed"),
});

// ─── Step 6: Description ─────────────────────────────────────────────────────
const BLACKLISTED_KEYWORDS = ["scam", "fake", "fraud", "test listing"];
const MIN_DESCRIPTION_WORDS = 50;

export const step6Schema = z.object({
  description: z
    .string()
    .min(1, "Description is required")
    .refine(
      (val) => val.trim().split(/\s+/).length >= MIN_DESCRIPTION_WORDS,
      `Description must be at least ${MIN_DESCRIPTION_WORDS} words`
    )
    .refine(
      (val) => !BLACKLISTED_KEYWORDS.some((kw) => val.toLowerCase().includes(kw)),
      "Description contains prohibited content"
    ),
});

// ─── Step 7: Contact Preferences ─────────────────────────────────────────────
export const step7Schema = z.object({
  phone: nepalPhoneSchema,
  show_phone: z.boolean().default(true),
  show_whatsapp: z.boolean().default(true),
  show_email: z.boolean().default(false),
  whatsapp: z.string().optional().nullable(),
});

// ─── Step 8: Review & Submit — full combined schema ───────────────────────────
export const listingCreateSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema)
  .merge(step6Schema)
  .merge(step7Schema);

export type ListingCreateInput = z.infer<typeof listingCreateSchema>;
export type Step1Input = z.infer<typeof step1Schema>;
export type Step2Input = z.infer<typeof step2Schema>;
export type Step3Input = z.infer<typeof step3Schema>;
export type Step4Input = z.infer<typeof step4Schema>;
export type Step5Input = z.infer<typeof step5Schema>;
export type Step6Input = z.infer<typeof step6Schema>;
export type Step7Input = z.infer<typeof step7Schema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// ─── Inquiry schema ───────────────────────────────────────────────────────────
export const inquirySchema = z.object({
  message: z
    .string()
    .min(20, "Message must be at least 20 characters")
    .max(1000, "Message too long"),
  move_in_date: z.string().optional().nullable(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

// ─── Visit request schema ─────────────────────────────────────────────────────
export const visitRequestSchema = z.object({
  preferred_date: z.string().min(1, "Select a preferred date"),
  notes: z.string().max(500).optional(),
});

export type VisitRequestInput = z.infer<typeof visitRequestSchema>;

// Combined listing form schema (all steps merged)
export const listingFormSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema)
  .merge(step6Schema)
  .merge(step7Schema);

export type ListingFormData = z.infer<typeof listingFormSchema>;
