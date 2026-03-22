import type { NutritionPlanResponse } from "@/features/nutrition/types";
import type { TrainingPlanResponse } from "@/features/training-plan/types";

export type NutritionHistoryItem = {
  id: string;
  createdAt: string;
  goal: string;
  targetCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  details: NutritionPlanResponse;
};

export type TrainingHistoryItem = {
  id: string;
  createdAt: string;
  title: string;
  trainingDays: number;
  goal: string;
  details: TrainingPlanResponse;
};

export type BodyMetricRecord = {
  id: string;
  weightKg: number;
  bodyFatPercentage: number | null;
  recordedAt: string;
  createdAt: string;
};

export type BodyMetricCreateInput = {
  weightKg: number;
  bodyFatPercentage?: number | null;
  recordedAt: string;
};
