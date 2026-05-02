import { z } from "zod";
import type { TokenPair } from "@/lib/api/types";

const tokenPairSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.literal("bearer"),
});

const syntheticIdsSchema = z.object({
  newListingId: z.string(),
  newInquiryId: z.string(),
  newVisitId: z.string(),
  newImageId: z.string(),
  favoriteDefaultUserId: z.string(),
});

const uploadTemplatesSchema = z.object({
  uploadUrlTemplate: z.string(),
  storageKeyTemplate: z.string(),
  publicUrlTemplate: z.string(),
});

const loginAccountSchema = z.object({
  email: z.string(),
  password: z.string(),
  tokens: z.enum(["renter", "owner", "agent", "admin"]),
});

const authLoginsSchema = z.object({
  loginAccounts: z.array(loginAccountSchema),
  registerConflictEmail: z.string(),
});

export function parseAdminAuthTokensFromMsw(data: unknown): TokenPair {
  return tokenPairSchema.parse(data) as TokenPair;
}

export function parseMswSyntheticIds(data: unknown): z.infer<typeof syntheticIdsSchema> {
  return syntheticIdsSchema.parse(data);
}

export function parseMswUploadTemplates(data: unknown): z.infer<typeof uploadTemplatesSchema> {
  return uploadTemplatesSchema.parse(data);
}

export function parseMswAuthLogins(data: unknown): z.infer<typeof authLoginsSchema> {
  return authLoginsSchema.parse(data);
}
