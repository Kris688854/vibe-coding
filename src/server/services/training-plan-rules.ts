import { eq, inArray } from "drizzle-orm";
import type {
  ExperienceLevel,
  SplitType,
  TrainingPlanRequest,
  TrainingRestriction,
} from "@/features/training-plan/types";
import { db } from "@/lib/db/client";
import { exercises } from "@/lib/db/schema";
import { trainingPlanDayDraftSchema } from "@/lib/validations/training-plan";

type RuleExerciseDraft = {
  exerciseId: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes: string;
};

type ExerciseRecord = {
  id: string;
  name: string;
  category: string;
  equipment: string[];
  difficulty: string;
};

const splitTemplates: Record<
  SplitType,
  Record<TrainingPlanRequest["trainingDaysPerWeek"], Array<{ label: string; focus: string; categories: string[] }>>
> = {
  "full-body": {
    3: [
      { label: "周一", focus: "全身 A", categories: ["legs", "chest", "back", "shoulders", "core"] },
      { label: "周三", focus: "全身 B", categories: ["back", "legs", "arms", "shoulders", "core"] },
      { label: "周五", focus: "全身 C", categories: ["chest", "legs", "back", "arms", "core"] },
    ],
    4: [
      { label: "周一", focus: "全身 A", categories: ["legs", "chest", "back", "core"] },
      { label: "周二", focus: "全身 B", categories: ["back", "shoulders", "arms", "core"] },
      { label: "周四", focus: "全身 C", categories: ["legs", "chest", "shoulders", "core"] },
      { label: "周六", focus: "全身 D", categories: ["back", "legs", "arms", "core"] },
    ],
    5: [
      { label: "周一", focus: "全身 A", categories: ["legs", "chest", "back", "core"] },
      { label: "周二", focus: "全身 B", categories: ["shoulders", "arms", "core"] },
      { label: "周三", focus: "下肢强化", categories: ["legs", "core"] },
      { label: "周五", focus: "上肢推拉", categories: ["chest", "back", "shoulders", "arms"] },
      { label: "周六", focus: "全身泵感", categories: ["legs", "chest", "back", "core"] },
    ],
    6: [
      { label: "周一", focus: "全身 A", categories: ["legs", "chest", "back"] },
      { label: "周二", focus: "全身 B", categories: ["shoulders", "arms", "core"] },
      { label: "周三", focus: "下肢强化", categories: ["legs", "core"] },
      { label: "周四", focus: "推", categories: ["chest", "shoulders", "arms"] },
      { label: "周五", focus: "拉", categories: ["back", "arms", "core"] },
      { label: "周六", focus: "全身补量", categories: ["legs", "chest", "back", "core"] },
    ],
  },
  ppl: {
    3: [
      { label: "周一", focus: "Push", categories: ["chest", "shoulders", "arms"] },
      { label: "周三", focus: "Pull", categories: ["back", "arms", "core"] },
      { label: "周五", focus: "Legs", categories: ["legs", "core"] },
    ],
    4: [
      { label: "周一", focus: "Push", categories: ["chest", "shoulders", "arms"] },
      { label: "周二", focus: "Pull", categories: ["back", "arms", "core"] },
      { label: "周四", focus: "Legs", categories: ["legs", "core"] },
      { label: "周六", focus: "Push/Pull Mix", categories: ["chest", "back", "shoulders", "arms"] },
    ],
    5: [
      { label: "周一", focus: "Push", categories: ["chest", "shoulders", "arms"] },
      { label: "周二", focus: "Pull", categories: ["back", "arms", "core"] },
      { label: "周三", focus: "Legs", categories: ["legs", "core"] },
      { label: "周五", focus: "Push", categories: ["chest", "shoulders", "arms"] },
      { label: "周六", focus: "Pull/Legs Mix", categories: ["back", "legs", "core"] },
    ],
    6: [
      { label: "周一", focus: "Push A", categories: ["chest", "shoulders", "arms"] },
      { label: "周二", focus: "Pull A", categories: ["back", "arms", "core"] },
      { label: "周三", focus: "Legs A", categories: ["legs", "core"] },
      { label: "周四", focus: "Push B", categories: ["chest", "shoulders", "arms"] },
      { label: "周五", focus: "Pull B", categories: ["back", "arms", "core"] },
      { label: "周六", focus: "Legs B", categories: ["legs", "core"] },
    ],
  },
  "upper-lower": {
    3: [
      { label: "周一", focus: "上肢", categories: ["chest", "back", "shoulders", "arms"] },
      { label: "周三", focus: "下肢", categories: ["legs", "core"] },
      { label: "周五", focus: "上肢 / 核心", categories: ["chest", "back", "arms", "core"] },
    ],
    4: [
      { label: "周一", focus: "上肢 A", categories: ["chest", "back", "shoulders", "arms"] },
      { label: "周二", focus: "下肢 A", categories: ["legs", "core"] },
      { label: "周四", focus: "上肢 B", categories: ["chest", "back", "shoulders", "arms"] },
      { label: "周六", focus: "下肢 B", categories: ["legs", "core"] },
    ],
    5: [
      { label: "周一", focus: "上肢 A", categories: ["chest", "back", "shoulders", "arms"] },
      { label: "周二", focus: "下肢 A", categories: ["legs", "core"] },
      { label: "周三", focus: "上肢 B", categories: ["chest", "back", "arms"] },
      { label: "周五", focus: "下肢 B", categories: ["legs", "core"] },
      { label: "周六", focus: "上肢泵感", categories: ["chest", "back", "shoulders", "arms"] },
    ],
    6: [
      { label: "周一", focus: "上肢 A", categories: ["chest", "back", "shoulders", "arms"] },
      { label: "周二", focus: "下肢 A", categories: ["legs", "core"] },
      { label: "周三", focus: "上肢 B", categories: ["chest", "back", "shoulders", "arms"] },
      { label: "周四", focus: "下肢 B", categories: ["legs", "core"] },
      { label: "周五", focus: "上肢 C", categories: ["chest", "back", "arms"] },
      { label: "周六", focus: "下肢 / 核心", categories: ["legs", "core"] },
    ],
  },
  "bro-split": {
    3: [
      { label: "周一", focus: "胸肩三头", categories: ["chest", "shoulders", "arms"] },
      { label: "周三", focus: "背二头", categories: ["back", "arms", "core"] },
      { label: "周五", focus: "腿部", categories: ["legs", "core"] },
    ],
    4: [
      { label: "周一", focus: "胸", categories: ["chest", "arms"] },
      { label: "周二", focus: "背", categories: ["back", "arms"] },
      { label: "周四", focus: "腿", categories: ["legs", "core"] },
      { label: "周六", focus: "肩臂", categories: ["shoulders", "arms", "core"] },
    ],
    5: [
      { label: "周一", focus: "胸", categories: ["chest", "arms"] },
      { label: "周二", focus: "背", categories: ["back", "arms"] },
      { label: "周三", focus: "腿", categories: ["legs", "core"] },
      { label: "周五", focus: "肩", categories: ["shoulders", "arms"] },
      { label: "周六", focus: "手臂 / 核心", categories: ["arms", "core"] },
    ],
    6: [
      { label: "周一", focus: "胸", categories: ["chest", "arms"] },
      { label: "周二", focus: "背", categories: ["back", "arms"] },
      { label: "周三", focus: "腿", categories: ["legs", "core"] },
      { label: "周四", focus: "肩", categories: ["shoulders", "arms"] },
      { label: "周五", focus: "手臂", categories: ["arms", "core"] },
      { label: "周六", focus: "后链 / 核心", categories: ["back", "legs", "core"] },
    ],
  },
};

const forbiddenByRestriction: Record<TrainingRestriction, string[]> = {
  no_squat: ["barbell_squat", "front_squat"],
  no_deadlift: ["deadlift", "romanian_deadlift"],
  no_overhead_press: ["overhead_press", "dumbbell_shoulder_press", "arnold_press"],
};

const equipmentAllowMap: Record<TrainingPlanRequest["equipmentAccess"], string[]> = {
  gym: [],
  dumbbell: ["哑铃", "自重", "平凳", "上斜凳", "瑜伽垫", "双杠架", "单杠"],
  bodyweight: ["自重", "瑜伽垫", "单杠", "双杠架"],
};

const repsByLevel: Record<ExperienceLevel, { compound: string; isolate: string; rest: number }> = {
  beginner: { compound: "8-12", isolate: "10-15", rest: 75 },
  intermediate: { compound: "6-10", isolate: "10-15", rest: 90 },
  advanced: { compound: "5-8", isolate: "8-12", rest: 105 },
};

const setsByDuration: Record<number, number> = {
  45: 4,
  60: 5,
  75: 6,
  90: 7,
};

function isCompound(exercise: ExerciseRecord) {
  return ["legs", "chest", "back", "shoulders"].includes(exercise.category);
}

function isEquipmentAllowed(
  exercise: ExerciseRecord,
  equipmentAccess: TrainingPlanRequest["equipmentAccess"],
) {
  if (equipmentAccess === "gym") {
    return true;
  }

  const allowList = equipmentAllowMap[equipmentAccess];
  return exercise.equipment.some((item) => allowList.some((allowed) => item.includes(allowed)));
}

function matchesLevel(
  exercise: ExerciseRecord,
  experienceLevel: ExperienceLevel,
) {
  if (experienceLevel === "advanced") {
    return true;
  }
  if (experienceLevel === "beginner") {
    return exercise.difficulty === "beginner" || exercise.difficulty === "intermediate";
  }
  return exercise.difficulty !== "advanced" || exercise.category === "legs";
}

function filterByRestrictions(
  records: ExerciseRecord[],
  restrictions: TrainingRestriction[],
) {
  const blockedIds = new Set(
    restrictions.flatMap((restriction) => forbiddenByRestriction[restriction]),
  );
  return records.filter((exercise) => !blockedIds.has(exercise.id));
}

function pickExercisesForCategory(
  pool: ExerciseRecord[],
  category: string,
  count: number,
) {
  return pool
    .filter((exercise) => exercise.category === category)
    .slice(0, count);
}

function buildExerciseDraft(
  exercise: ExerciseRecord,
  orderIndex: number,
  experienceLevel: ExperienceLevel,
) {
  const preset = repsByLevel[experienceLevel];
  const compound = isCompound(exercise);
  const sets =
    experienceLevel === "advanced" && compound
      ? 4
      : experienceLevel === "beginner"
        ? 3
        : 3;

  const draft: RuleExerciseDraft = {
    exerciseId: exercise.id,
    sets,
    reps: compound ? preset.compound : preset.isolate,
    restSeconds: compound ? preset.rest : Math.max(45, preset.rest - 30),
    notes:
      orderIndex === 0
        ? "作为当天主练动作，优先保证动作质量和完整热身。"
        : compound
          ? "保持稳定节奏，最后 1 到 2 组接近力竭。"
          : "以目标肌群发力感为主，控制离心速度。",
  };

  return draft;
}

function summarizeFocus(categories: string[]) {
  const labelMap: Record<string, string> = {
    chest: "胸",
    back: "背",
    legs: "腿",
    shoulders: "肩",
    arms: "手臂",
    core: "核心",
  };

  return categories.map((category) => labelMap[category] ?? category).join("、");
}

export async function generateTrainingPlanFromRules(
  request: TrainingPlanRequest,
) {
  const allExercises = (await db.select().from(exercises)) as ExerciseRecord[];
  const filteredPool = filterByRestrictions(
    allExercises.filter(
      (exercise) =>
        isEquipmentAllowed(exercise, request.equipmentAccess) &&
        matchesLevel(exercise, request.experienceLevel),
    ),
    request.restrictions,
  );
  const fallbackPool =
    filteredPool.length > 0
      ? filteredPool
      : filterByRestrictions(allExercises, request.restrictions);

  const template = splitTemplates[request.splitType][request.trainingDaysPerWeek];
  const maxExerciseCount = setsByDuration[request.sessionDurationMinutes] ?? 5;

  const days = template.map((slot, dayIndex) => {
    const distributedCounts = slot.categories.map((category, categoryIndex) => ({
      category,
      count: categoryIndex < 2 ? 2 : 1,
    }));

    const selectedExercises = distributedCounts.flatMap(({ category, count }) =>
      pickExercisesForCategory(filteredPool, category, count),
    );

    const deduped = Array.from(
      new Map(selectedExercises.map((exercise) => [exercise.id, exercise])).values(),
    ).slice(0, maxExerciseCount);

    const fallbackExercises =
      deduped.length > 0
        ? deduped
        : fallbackPool.slice(dayIndex, dayIndex + Math.max(3, maxExerciseCount));

    const exerciseDrafts = fallbackExercises.map((exercise, orderIndex) => ({
      ...buildExerciseDraft(exercise, orderIndex, request.experienceLevel),
      exercise,
    }));

    const parsed = trainingPlanDayDraftSchema.parse({
      label: slot.label,
      focus: slot.focus,
      summary: `当天重点覆盖 ${summarizeFocus(slot.categories)}，先做复合动作，再用孤立动作补足训练量。`,
      exercises: exerciseDrafts.map((item) => ({
        exerciseId: item.exerciseId,
        sets: item.sets,
        reps: item.reps,
        restSeconds: item.restSeconds,
        notes: item.notes,
      })),
    });

    return {
      label: parsed.label,
      focus: parsed.focus,
      summary: parsed.summary,
      exercises: exerciseDrafts.map((item, index) => ({
        id: `draft-${dayIndex + 1}-${index + 1}`,
        exerciseId: item.exercise.id,
        name: item.exercise.name,
        category: item.exercise.category,
        sets: item.sets,
        reps: item.reps,
        restSeconds: item.restSeconds,
        notes: item.notes,
      })),
    };
  });

  const goalLabel =
    request.goal === "bulk"
      ? "增肌"
      : request.goal === "cut"
        ? "减脂"
        : request.goal === "recomp"
          ? "体态重组"
          : "维持";

  return {
    title: `${goalLabel}${request.trainingDaysPerWeek}练 ${request.splitType} 周计划`,
    summary: `基于 ${request.experienceLevel} 水平、${request.equipmentAccess} 器械条件和每次 ${request.sessionDurationMinutes} 分钟时长生成的一周训练安排。`,
    weeklySchedule: days.map((day) => `${day.label} · ${day.focus}`),
    days,
  };
}
