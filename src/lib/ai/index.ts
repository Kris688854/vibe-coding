import type { AiNutritionProvider } from "@/lib/ai/types";
import { MockNutritionProvider } from "@/lib/ai/mock-provider";
import type { AiTrainingPlanProvider } from "@/lib/ai/training-types";
import { MockTrainingPlanProvider } from "@/lib/ai/training-mock-provider";

export function getNutritionAiProvider(): AiNutritionProvider {
  return new MockNutritionProvider();
}

export function getTrainingPlanAiProvider(): AiTrainingPlanProvider {
  return new MockTrainingPlanProvider();
}
