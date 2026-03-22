import { z } from "zod";

export const bodyMetricCreateSchema = z.object({
  weightKg: z.number().min(20).max(400),
  bodyFatPercentage: z.number().min(2).max(70).nullable().optional(),
  recordedAt: z.string().min(1),
});
