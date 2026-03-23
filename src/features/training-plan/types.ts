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
export type TrainingDayType =
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "legs"
  | "push"
  | "pull"
  | "upper"
  | "lower"
  | "full_body";
export type TrainingMuscleTarget =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "quadriceps"
  | "hamstrings"
  | "gluteus"
  | "calves"
  | "core";

export type TrainingPlanRequest = {
  goal: TrainingGoal;
  trainingDaysPerWeek: TrainingDaysPerWeek;
  experienceLevel: ExperienceLevel;
  splitType: SplitType;
  equipmentAccess: EquipmentAccess;
  sessionDurationMinutes: 45 | 60 | 75 | 90;
  restrictions: TrainingRestriction[];
};

export type ExerciseDayRuleMetadata = {
  primaryDays: TrainingDayType[];
  secondaryDays: TrainingDayType[];
  excludedDays: TrainingDayType[];
};

export type TrainingCoverageRule = {
  targets: TrainingMuscleTarget[];
  minimum: number;
  description: string;
};

export type TrainingDayTemplate = {
  label: string;
  focus: string;
  dayType: TrainingDayType;
  requiredPrimaryTargets: TrainingMuscleTarget[];
  allowedSecondaryTargets: TrainingMuscleTarget[];
  forbiddenTargets: TrainingMuscleTarget[];
  minCompoundCount: number;
  minIsolationCount: number;
  coverageRules: TrainingCoverageRule[];
};

export type TrainingDayConstraintResult = {
  isValid: boolean;
  missingTargets: TrainingMuscleTarget[];
  reasons: string[];
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
