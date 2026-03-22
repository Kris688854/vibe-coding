import { randomUUID } from "node:crypto";
import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  trainingPlanDayExercises,
  trainingPlanDays,
  trainingPlanProfiles,
  trainingPlans,
  exercises,
} from "@/lib/db/schema";
import { getTrainingPlanAiProvider } from "@/lib/ai";
import type {
  TrainingPlanListItem,
  TrainingPlanRequest,
  TrainingPlanResponse,
} from "@/features/training-plan/types";
import { trainingPlanAiEnhancementSchema } from "@/lib/validations/training-plan";
import { generateTrainingPlanFromRules } from "@/server/services/training-plan-rules";

export async function createTrainingPlan(
  request: TrainingPlanRequest,
): Promise<TrainingPlanResponse> {
  const profileId = randomUUID();
  const planId = randomUUID();
  const provider = getTrainingPlanAiProvider();
  const draft = await generateTrainingPlanFromRules(request);

  let source: TrainingPlanResponse["source"] = "rules";
  let explanation = [
    "这套计划优先按照你的训练频率、器械条件和分化方式，把一周训练量稳定分摊到每个训练日。",
    "每天先安排更值得进步的复合动作，再用孤立动作补足目标肌群刺激，方便你后续做负重或次数递进。",
    "在单次时长限制下，动作数量和组数都做了控制，避免计划看起来很满但实际执行不完。",
  ];

  try {
    const generated = await provider.generateExplanation({
      request,
      title: draft.title,
      summary: draft.summary,
      weeklySchedule: draft.weeklySchedule,
      days: draft.days.map((day) => ({
        label: day.label,
        focus: day.focus,
        summary: day.summary,
      })),
    });
    explanation = trainingPlanAiEnhancementSchema.parse(generated).explanation;
    source = "rules+ai";
  } catch (error) {
    console.warn("Training plan AI provider fell back to rule-only explanation:", error);
  }

  await db.insert(trainingPlanProfiles).values({
    id: profileId,
    goal: request.goal,
    trainingDaysPerWeek: request.trainingDaysPerWeek,
    experienceLevel: request.experienceLevel,
    splitType: request.splitType,
    equipmentAccess: request.equipmentAccess,
    sessionDurationMinutes: request.sessionDurationMinutes,
    restrictions: request.restrictions,
  });

  await db.insert(trainingPlans).values({
    id: planId,
    profileId,
    title: draft.title,
    summary: draft.summary,
    explanation,
    generationSource: source,
  });

  for (const [dayIndex, day] of draft.days.entries()) {
    const dayId = randomUUID();
    await db.insert(trainingPlanDays).values({
      id: dayId,
      planId,
      dayIndex: dayIndex + 1,
      label: day.label,
      focus: day.focus,
      summary: day.summary,
    });

    for (const [exerciseIndex, exercise] of day.exercises.entries()) {
      await db.insert(trainingPlanDayExercises).values({
        id: randomUUID(),
        dayId,
        exerciseId: exercise.exerciseId,
        orderIndex: exerciseIndex + 1,
        sets: exercise.sets,
        reps: exercise.reps,
        restSeconds: exercise.restSeconds,
        notes: exercise.notes,
      });
    }
  }

  return {
    id: planId,
    title: draft.title,
    summary: draft.summary,
    weeklySchedule: draft.weeklySchedule,
    days: draft.days.map((day, index) => ({
      id: `draft-day-${index + 1}`,
      dayIndex: index + 1,
      label: day.label,
      focus: day.focus,
      summary: day.summary,
      exercises: day.exercises,
    })),
    explanation,
    source,
  };
}

export async function listTrainingPlans(): Promise<TrainingPlanListItem[]> {
  const records = await db
    .select()
    .from(trainingPlans)
    .orderBy(asc(trainingPlans.createdAt));

  return Promise.all(
    records.map(async (record) => {
      const days = await db
        .select()
        .from(trainingPlanDays)
        .where(eq(trainingPlanDays.planId, record.id))
        .orderBy(asc(trainingPlanDays.dayIndex));

      return {
        id: record.id,
        title: record.title,
        summary: record.summary,
        createdAt: record.createdAt,
        weeklySchedule: days.map((day) => `${day.label} · ${day.focus}`),
      };
    }),
  );
}

export async function getTrainingPlanById(
  planId: string,
): Promise<TrainingPlanResponse | null> {
  const [plan] = await db
    .select()
    .from(trainingPlans)
    .where(eq(trainingPlans.id, planId));

  if (!plan) {
    return null;
  }

  const days = await db
    .select()
    .from(trainingPlanDays)
    .where(eq(trainingPlanDays.planId, planId))
    .orderBy(asc(trainingPlanDays.dayIndex));

  const dayIds = days.map((day) => day.id);
  const dayExercises = dayIds.length
    ? await db
        .select()
        .from(trainingPlanDayExercises)
        .where(inArray(trainingPlanDayExercises.dayId, dayIds))
        .orderBy(
          asc(trainingPlanDayExercises.dayId),
          asc(trainingPlanDayExercises.orderIndex),
        )
    : [];

  const exerciseIds = dayExercises.map((item) => item.exerciseId);
  const exerciseRecords = exerciseIds.length
    ? await db.select().from(exercises).where(inArray(exercises.id, exerciseIds))
    : [];
  const exerciseLookup = new Map(exerciseRecords.map((record) => [record.id, record]));

  return {
    id: plan.id,
    title: plan.title,
    summary: plan.summary,
    weeklySchedule: days.map((day) => `${day.label} · ${day.focus}`),
    days: days.map((day) => ({
      id: day.id,
      dayIndex: day.dayIndex,
      label: day.label,
      focus: day.focus,
      summary: day.summary,
      exercises: dayExercises
        .filter((item) => item.dayId === day.id)
        .map((item) => ({
          id: item.id,
          exerciseId: item.exerciseId,
          name: exerciseLookup.get(item.exerciseId)?.name ?? "未知动作",
          category: exerciseLookup.get(item.exerciseId)?.category ?? "unknown",
          sets: item.sets,
          reps: item.reps,
          restSeconds: item.restSeconds,
          notes: item.notes,
        })),
    })),
    explanation: plan.explanation,
    source: plan.generationSource as TrainingPlanResponse["source"],
  };
}
