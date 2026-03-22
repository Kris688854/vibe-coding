import { z } from "zod";

export const nutritionPlanRequestSchema = z.object({
  age: z.number().int().min(16).max(80),
  sex: z.enum(["male", "female"]),
  heightCm: z.number().min(130).max(230),
  weightKg: z.number().min(35).max(250),
  activityLevel: z.enum([
    "sedentary",
    "light",
    "moderate",
    "active",
    "very_active",
  ]),
  goal: z.enum(["fat_loss", "maintenance", "muscle_gain"]),
  dietPreference: z.enum(["balanced", "high_protein", "vegetarian", "low_carb"]),
  mealsPerDay: z.number().int().min(2).max(6),
  dayType: z.enum(["training", "rest"]).default("training"),
  allergies: z.array(z.string().min(1)).default([]),
  notes: z.string().max(500).optional().default(""),
});

const mealPlanScenarioSchema = z.object({
  summary: z.string().min(1),
  breakfast: z.array(z.string().min(1)).min(1),
  lunch: z.array(z.string().min(1)).min(1),
  dinner: z.array(z.string().min(1)).min(1),
  snacks: z.array(z.string().min(1)).min(1),
  substitutions: z.array(z.string().min(1)).min(1),
});

export const aiNutritionContentSchema = z.object({
  reasoning: z.array(z.string().min(1)).min(3).max(5),
  mealPlans: z.object({
    cafeteria: mealPlanScenarioSchema,
    convenienceStore: mealPlanScenarioSchema,
    fitnessStandard: mealPlanScenarioSchema,
  }),
});

export type NutritionPlanRequestInput = z.infer<
  typeof nutritionPlanRequestSchema
>;
export type AiNutritionContentInput = z.infer<typeof aiNutritionContentSchema>;
