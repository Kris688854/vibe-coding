import { randomUUID } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import type {
  BodyMetricCreateInput,
  BodyMetricRecord,
  NutritionHistoryItem,
  TrainingHistoryItem,
} from "@/features/history/types";
import type { NutritionPlanResponse } from "@/features/nutrition/types";
import { db } from "@/lib/db/client";
import {
  bodyMetrics,
  nutritionPlans,
  nutritionProfiles,
  trainingPlanProfiles,
  trainingPlans,
} from "@/lib/db/schema";
import { getTrainingPlanById } from "@/server/services/training-plan-service";

export async function listNutritionHistory(): Promise<NutritionHistoryItem[]> {
  const planRows = await db
    .select()
    .from(nutritionPlans)
    .orderBy(desc(nutritionPlans.createdAt));

  const items = await Promise.all(
    planRows.map(async (planRow) => {
      const [profile] = await db
        .select()
        .from(nutritionProfiles)
        .where(eq(nutritionProfiles.id, planRow.profileId));

      const details = planRow.mealPlanJson as NutritionPlanResponse;

      return {
        id: planRow.id,
        createdAt: planRow.createdAt,
        goal: profile?.goal ?? "unknown",
        targetCalories: planRow.targetCalories,
        proteinG: planRow.proteinGrams,
        carbsG: planRow.carbsGrams,
        fatG: planRow.fatGrams,
        details,
      };
    }),
  );

  return items;
}

export async function listTrainingHistory(): Promise<TrainingHistoryItem[]> {
  const planRows = await db
    .select()
    .from(trainingPlans)
    .orderBy(desc(trainingPlans.createdAt));

  const items = await Promise.all(
    planRows.map(async (planRow) => {
      const [profile] = await db
        .select()
        .from(trainingPlanProfiles)
        .where(eq(trainingPlanProfiles.id, planRow.profileId));
      const details = await getTrainingPlanById(planRow.id);

      return {
        id: planRow.id,
        createdAt: planRow.createdAt,
        title: planRow.title,
        trainingDays: profile?.trainingDaysPerWeek ?? details?.days.length ?? 0,
        goal: profile?.goal ?? "unknown",
        details:
          details ??
          {
            id: planRow.id,
            title: planRow.title,
            summary: planRow.summary,
            weeklySchedule: [],
            days: [],
            explanation: planRow.explanation,
            source: planRow.generationSource as "rules" | "rules+ai",
          },
      };
    }),
  );

  return items;
}

export async function listBodyMetrics(): Promise<BodyMetricRecord[]> {
  const rows = await db
    .select()
    .from(bodyMetrics)
    .orderBy(desc(bodyMetrics.recordedAt), desc(bodyMetrics.createdAt));

  return rows.map((row) => ({
    id: row.id,
    weightKg: row.weightKg,
    bodyFatPercentage: row.bodyFatPercentage ?? null,
    recordedAt: row.recordedAt,
    createdAt: row.createdAt,
  }));
}

export async function createBodyMetric(
  input: BodyMetricCreateInput,
): Promise<BodyMetricRecord> {
  const record = {
    id: randomUUID(),
    weightKg: input.weightKg,
    bodyFatPercentage: input.bodyFatPercentage ?? null,
    recordedAt: input.recordedAt,
  };

  await db.insert(bodyMetrics).values(record);

  return {
    ...record,
    createdAt: new Date().toISOString(),
  };
}
