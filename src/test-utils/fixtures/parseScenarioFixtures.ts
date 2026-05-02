import { z } from "zod";

const mswScenariosSchema = z.object({
  messages: z.object({
    internalServerError: z.string(),
    forbidden: z.string(),
    notAuthenticated: z.string(),
    authUnavailable: z.string(),
    adminAnalyticsUnavailable: z.string(),
  }),
  numericKnobs: z.object({
    partialListingSliceEnd: z.number().int().positive(),
    stressBioRepeatLength: z.number().int().nonnegative(),
    stressAnalyticsTotalViews: z.number().int().nonnegative(),
  }),
});

export type MswScenarioKnobs = z.infer<typeof mswScenariosSchema>;

export function parseMswScenarioKnobs(data: unknown): MswScenarioKnobs {
  return mswScenariosSchema.parse(data);
}
