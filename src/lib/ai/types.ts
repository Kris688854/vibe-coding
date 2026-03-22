import type {
  AiNutritionContent,
  NutritionCalculation,
  NutritionPlanRequest,
} from "@/features/nutrition/types";

export type NutritionRuleMeta = {
  proteinPerKg: number;
  fatPerKg: number;
  activityMultiplier: number;
};

export type AiNutritionContext = {
  request: NutritionPlanRequest;
  calculation: NutritionCalculation;
  ruleMeta: NutritionRuleMeta;
};

export interface AiNutritionProvider {
  generateNutritionPlan(context: AiNutritionContext): Promise<AiNutritionContent>;
}
