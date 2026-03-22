import type { ExerciseDetail } from "@/features/exercises/types";

export type TrainingGoal = "bulk" | "cut" | "maintain" | "recomp";
export type TrainingDaysPerWeek = 3 | 4 | 5 | 6;
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type SplitType = "ppl" | "upper-lower" | "full-body" | "bro-split";
export type EquipmentAccess = "gym" | "dumbbell" | "bodyweight";
export type TrainingRestriction =
  | "no_squat"
  | "no_deadlift"
  | "no_overhead_press";

export type TrainingPlanRequest = {
  goal: TrainingGoal;
  trainingDaysPerWeek: TrainingDaysPerWeek;
  experienceLevel: ExperienceLevel;
  splitType: SplitType;
  equipmentAccess: EquipmentAccess;
  sessionDurationMinutes: 45 | 60 | 75 | 90;
  restrictions: TrainingRestriction[];
};

export type TrainingPlanDayExercise = {
  id: string;
  exerciseId: string;
  name: string;
  category: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes: string;
};

export type TrainingPlanDay = {
  id: string;
  dayIndex: number;
  label: string;
  focus: string;
  summary: string;
  exercises: TrainingPlanDayExercise[];
};

export type TrainingPlanResponse = {
  id: string;
  title: string;
  summary: string;
  weeklySchedule: string[];
  days: TrainingPlanDay[];
  explanation: string[];
  source: "rules" | "rules+ai";
};

export type TrainingPlanListItem = {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  weeklySchedule: string[];
};

export type TrainingPlanViewState = {
  selectedExerciseDetail: ExerciseDetail | null;
};
