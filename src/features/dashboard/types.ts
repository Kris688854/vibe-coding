export type WeeklyHeatmapMuscleScore = {
  muscleId: string;
  muscleKey: string;
  muscleName: string;
  category: string;
  color: string;
  score: number;
  primaryMeshKeys: string[];
  secondaryMeshKeys: string[];
};

export type WeeklyHeatmapResponse = {
  generatedAt: string;
  windowStart: string;
  windowEnd: string;
  source: "latest-plan" | "no-data";
  planId: string | null;
  planTitle: string | null;
  totalSessions: number;
  scoresByMuscleKey: Record<string, number>;
  meshScores: Record<string, number>;
  muscles: WeeklyHeatmapMuscleScore[];
};

export type BodyMetricTrendPoint = {
  id: string;
  recordedAt: string;
  weightKg: number;
  bodyFatPercentage: number | null;
};

export type NutritionTrendPoint = {
  id: string;
  createdAt: string;
  targetCalories: number;
  proteinG: number;
  goal: string;
  dayType: "training" | "rest" | null;
};

export type DashboardOverviewData = {
  weeklyHeatmap: WeeklyHeatmapResponse;
  bodyMetricTrend: BodyMetricTrendPoint[];
  nutritionTrend: NutritionTrendPoint[];
};
