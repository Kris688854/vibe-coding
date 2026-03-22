import type {
  NutritionCalculation,
  NutritionPlanRequest,
} from "@/features/nutrition/types";
import type { NutritionRuleMeta } from "@/lib/ai/types";

const activityMultiplier: Record<NutritionPlanRequest["activityLevel"], number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const goalAdjustment: Record<NutritionPlanRequest["goal"], number> = {
  fat_loss: -350,
  maintenance: 0,
  muscle_gain: 250,
};

export function calculateNutritionTargets(request: NutritionPlanRequest): {
  calculation: NutritionCalculation;
  ruleMeta: NutritionRuleMeta;
} {
  const baseBmr =
    request.sex === "male"
      ? 10 * request.weightKg + 6.25 * request.heightCm - 5 * request.age + 5
      : 10 * request.weightKg + 6.25 * request.heightCm - 5 * request.age - 161;

  const multiplier = activityMultiplier[request.activityLevel];
  const maintenanceRaw = baseBmr * multiplier;
  const targetCalories = Math.round(
    maintenanceRaw + goalAdjustment[request.goal],
  );

  const proteinPerKg =
    request.goal === "muscle_gain" ? 2.1 : request.goal === "fat_loss" ? 2 : 1.8;
  const fatPerKg = request.goal === "fat_loss" ? 0.8 : 0.9;

  const proteinG = Math.round(request.weightKg * proteinPerKg);
  const fatG = Math.round(request.weightKg * fatPerKg);
  const carbsCalories = targetCalories - proteinG * 4 - fatG * 9;
  const carbsG = Math.max(80, Math.round(carbsCalories / 4));
  const waterMl = Math.round(
    request.weightKg * 35 + (request.mealsPerDay - 3) * 150,
  );

  return {
    calculation: {
      maintenanceCalories: Math.round(maintenanceRaw),
      targetCalories,
      proteinG,
      carbsG,
      fatG,
      waterMl,
    },
    ruleMeta: {
      proteinPerKg,
      fatPerKg,
      activityMultiplier: multiplier,
    },
  };
}
