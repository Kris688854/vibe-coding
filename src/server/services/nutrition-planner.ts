import { randomUUID } from "node:crypto";
import { db } from "@/lib/db/client";
import { getNutritionAiProvider } from "@/lib/ai";
import type {
  NutritionPlanRequest,
  NutritionPlanResponse,
} from "@/features/nutrition/types";
import { aiNutritionContentSchema } from "@/lib/validations/nutrition";
import { nutritionPlans, nutritionProfiles } from "@/lib/db/schema";
import { generateDeterministicNutritionContent } from "@/lib/ai/mock-provider";
import { calculateNutritionTargets } from "@/server/services/nutrition-rules";

export async function createNutritionPlan(
  request: NutritionPlanRequest,
): Promise<NutritionPlanResponse> {
  const dayType = request.dayType ?? "training";
  const normalizedRequest: NutritionPlanRequest = {
    ...request,
    dayType,
  };
  const { calculation, ruleMeta } = calculateNutritionTargets(normalizedRequest);
  const provider = getNutritionAiProvider();

  let source: NutritionPlanResponse["source"] = "rules";
  let aiContent = generateDeterministicNutritionContent({
    request: normalizedRequest,
    calculation,
    ruleMeta,
  });
  let aiRawJson: unknown = null;

  try {
    const generated = await provider.generateNutritionPlan({
      request: normalizedRequest,
      calculation,
      ruleMeta,
    });
    aiContent = aiNutritionContentSchema.parse(generated);
    aiRawJson = generated;
    source = "rules+ai";
  } catch (error) {
    console.warn("Nutrition AI provider fell back to deterministic content:", error);
  }

  const response: NutritionPlanResponse = {
    calculation,
    reasoning: aiContent.reasoning,
    mealPlans: aiContent.mealPlans,
    dayType,
    source,
  };

  const profileId = randomUUID();
  const planId = randomUUID();

  await db.insert(nutritionProfiles).values({
    id: profileId,
    goal: normalizedRequest.goal,
    sex: normalizedRequest.sex,
    age: normalizedRequest.age,
    heightCm: normalizedRequest.heightCm,
    weightKg: normalizedRequest.weightKg,
    activityLevel: normalizedRequest.activityLevel,
    dietPreference: normalizedRequest.dietPreference,
    allergies: normalizedRequest.allergies,
  });

  await db.insert(nutritionPlans).values({
    id: planId,
    profileId,
    targetCalories: response.calculation.targetCalories,
    proteinGrams: response.calculation.proteinG,
    carbsGrams: response.calculation.carbsG,
    fatGrams: response.calculation.fatG,
    waterMl: response.calculation.waterMl,
    mealPlanJson: response,
    aiRawJson,
    calculationSource: source,
  });

  return response;
}
