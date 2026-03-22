import { desc, eq, inArray } from "drizzle-orm";
import type { NutritionPlanResponse } from "@/features/nutrition/types";
import type {
  BodyMetricTrendPoint,
  DashboardOverviewData,
  NutritionTrendPoint,
  WeeklyHeatmapMuscleScore,
  WeeklyHeatmapResponse,
} from "@/features/dashboard/types";
import { db } from "@/lib/db/client";
import {
  bodyMetrics,
  exerciseMuscles,
  muscles,
  nutritionPlans,
  nutritionProfiles,
  trainingPlanDayExercises,
  trainingPlanDays,
  trainingPlans,
} from "@/lib/db/schema";

function getCurrentWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() + diffToMonday);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return {
    start,
    end,
  };
}

function toDateString(value: Date) {
  return value.toISOString().slice(0, 10);
}

function roundScore(value: number) {
  return Math.round(value * 10) / 10;
}

export async function getWeeklyHeatmap(): Promise<WeeklyHeatmapResponse> {
  const { start, end } = getCurrentWeekRange();
  const [latestPlan] = await db
    .select()
    .from(trainingPlans)
    .orderBy(desc(trainingPlans.createdAt))
    .limit(1);

  if (!latestPlan) {
    return {
      generatedAt: new Date().toISOString(),
      windowStart: toDateString(start),
      windowEnd: toDateString(end),
      source: "no-data",
      planId: null,
      planTitle: null,
      totalSessions: 0,
      scoresByMuscleKey: {},
      meshScores: {},
      muscles: [],
    };
  }

  const days = await db
    .select()
    .from(trainingPlanDays)
    .where(eq(trainingPlanDays.planId, latestPlan.id));

  const dayIds = days.map((day) => day.id);
  const dayExercises = dayIds.length
    ? await db
        .select()
        .from(trainingPlanDayExercises)
        .where(inArray(trainingPlanDayExercises.dayId, dayIds))
    : [];

  const exerciseIds = [...new Set(dayExercises.map((item) => item.exerciseId))];

  if (!exerciseIds.length) {
    return {
      generatedAt: new Date().toISOString(),
      windowStart: toDateString(start),
      windowEnd: toDateString(end),
      source: "latest-plan",
      planId: latestPlan.id,
      planTitle: latestPlan.title,
      totalSessions: days.length,
      scoresByMuscleKey: {},
      meshScores: {},
      muscles: [],
    };
  }

  const muscleLinks = await db
    .select({
      exerciseId: exerciseMuscles.exerciseId,
      role: exerciseMuscles.role,
      muscleId: muscles.id,
      muscleKey: muscles.slug,
      muscleName: muscles.name,
      category: muscles.category,
      color: muscles.color,
      primaryMeshKeys: muscles.primaryMeshKeys,
      secondaryMeshKeys: muscles.secondaryMeshKeys,
    })
    .from(exerciseMuscles)
    .innerJoin(muscles, eq(exerciseMuscles.muscleId, muscles.id))
    .where(inArray(exerciseMuscles.exerciseId, exerciseIds));

  const linksByExercise = new Map<string, typeof muscleLinks>();
  for (const link of muscleLinks) {
    const current = linksByExercise.get(link.exerciseId) ?? [];
    current.push(link);
    linksByExercise.set(link.exerciseId, current);
  }

  const muscleScoreMap = new Map<string, WeeklyHeatmapMuscleScore>();
  const meshScores: Record<string, number> = {};

  for (const item of dayExercises) {
    const links = linksByExercise.get(item.exerciseId) ?? [];

    for (const link of links) {
      const roleWeight = link.role === "primary" ? 1 : 0.5;
      const score = item.sets * roleWeight;
      const existing = muscleScoreMap.get(link.muscleKey);

      if (existing) {
        existing.score = roundScore(existing.score + score);
      } else {
        muscleScoreMap.set(link.muscleKey, {
          muscleId: link.muscleId,
          muscleKey: link.muscleKey,
          muscleName: link.muscleName,
          category: link.category,
          color: link.color,
          score: roundScore(score),
          primaryMeshKeys: link.primaryMeshKeys,
          secondaryMeshKeys: link.secondaryMeshKeys,
        });
      }

      const relatedMeshKeys = new Set([
        ...link.primaryMeshKeys,
        ...link.secondaryMeshKeys,
      ]);

      for (const meshKey of relatedMeshKeys) {
        meshScores[meshKey] = roundScore((meshScores[meshKey] ?? 0) + score);
      }
    }
  }

  const musclesList = [...muscleScoreMap.values()].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    return left.muscleName.localeCompare(right.muscleName, "zh-CN");
  });

  const scoresByMuscleKey = Object.fromEntries(
    musclesList.map((item) => [item.muscleKey, item.score]),
  );

  return {
    generatedAt: new Date().toISOString(),
    windowStart: toDateString(start),
    windowEnd: toDateString(end),
    source: "latest-plan",
    planId: latestPlan.id,
    planTitle: latestPlan.title,
    totalSessions: days.length,
    scoresByMuscleKey,
    meshScores,
    muscles: musclesList,
  };
}

export async function getBodyMetricTrend(): Promise<BodyMetricTrendPoint[]> {
  const rows = await db
    .select()
    .from(bodyMetrics)
    .orderBy(desc(bodyMetrics.recordedAt), desc(bodyMetrics.createdAt))
    .limit(8);

  return [...rows]
    .reverse()
    .map((row) => ({
      id: row.id,
      recordedAt: row.recordedAt,
      weightKg: row.weightKg,
      bodyFatPercentage: row.bodyFatPercentage ?? null,
    }));
}

export async function getNutritionTrend(): Promise<NutritionTrendPoint[]> {
  const rows = await db
    .select()
    .from(nutritionPlans)
    .orderBy(desc(nutritionPlans.createdAt))
    .limit(8);

  const profileIds = [...new Set(rows.map((row) => row.profileId))];
  const profiles = profileIds.length
    ? await db
        .select()
        .from(nutritionProfiles)
        .where(inArray(nutritionProfiles.id, profileIds))
    : [];

  const profileLookup = new Map(profiles.map((profile) => [profile.id, profile]));

  return [...rows]
    .reverse()
    .map((row) => {
      const details = row.mealPlanJson as NutritionPlanResponse | null;
      const profile = profileLookup.get(row.profileId);

      return {
        id: row.id,
        createdAt: row.createdAt,
        targetCalories: row.targetCalories,
        proteinG: row.proteinGrams,
        goal: profile?.goal ?? "unknown",
        dayType: details?.dayType ?? null,
      };
    });
}

export async function getDashboardOverviewData(): Promise<DashboardOverviewData> {
  const [weeklyHeatmap, bodyMetricTrend, nutritionTrend] = await Promise.all([
    getWeeklyHeatmap(),
    getBodyMetricTrend(),
    getNutritionTrend(),
  ]);

  return {
    weeklyHeatmap,
    bodyMetricTrend,
    nutritionTrend,
  };
}
