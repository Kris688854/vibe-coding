import { z } from "zod";

export const trainingPlanRequestSchema = z.object({
  goal: z.enum(["bulk", "cut", "maintain", "recomp"]),
  trainingDaysPerWeek: z.union([
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
  ]),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
  splitType: z.enum(["ppl", "upper-lower", "full-body", "bro-split"]),
  equipmentAccess: z.enum(["gym", "dumbbell", "bodyweight"]),
  sessionDurationMinutes: z.union([
    z.literal(45),
    z.literal(60),
    z.literal(75),
    z.literal(90),
  ]),
  restrictions: z
    .array(z.enum(["no_squat", "no_deadlift", "no_overhead_press"]))
    .default([]),
});

export const trainingPlanDayExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  sets: z.number().int().min(1),
  reps: z.string().min(1),
  restSeconds: z.number().int().min(15),
  notes: z.string().min(1),
});

export const trainingPlanDayDraftSchema = z.object({
  label: z.string().min(1),
  focus: z.string().min(1),
  summary: z.string().min(1),
  exercises: z.array(trainingPlanDayExerciseSchema).min(1),
});

export const trainingPlanAiEnhancementSchema = z.object({
  explanation: z.array(z.string().min(1)).min(3).max(5),
});

