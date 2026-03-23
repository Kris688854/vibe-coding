import { eq } from "drizzle-orm";
import type {
  EquipmentAccess,
  ExperienceLevel,
  SplitType,
  TrainingDayConstraintResult,
  TrainingDayTemplate,
  TrainingDayType,
  TrainingMuscleTarget,
  TrainingPlanRequest,
  TrainingRestriction,
} from "@/features/training-plan/types";
import { db } from "@/lib/db/client";
import { exerciseMuscles, exercises, muscles } from "@/lib/db/schema";
import { trainingPlanDayDraftSchema } from "@/lib/validations/training-plan";

type ExerciseRecord = {
  id: string;
  name: string;
  category: string;
  equipment: string[];
  difficulty: string;
  primaryDays: TrainingDayType[];
  secondaryDays: TrainingDayType[];
  excludedDays: TrainingDayType[];
};

type ExerciseCandidate = ExerciseRecord & {
  primaryMuscleIds: string[];
  secondaryMuscleIds: string[];
  primaryTargets: TrainingMuscleTarget[];
  allTargets: TrainingMuscleTarget[];
  compound: boolean;
};

type DaySeed = {
  label: string;
  focus: string;
  dayType: TrainingDayType;
};

type Bucket = {
  source: "primary" | "secondary";
  targets: TrainingMuscleTarget[];
  required: boolean;
  preferCompound: boolean;
  note: string;
};

type RuleTemplate = TrainingDayTemplate & {
  selectionPlan: Bucket[];
  firstExerciseTargets: TrainingMuscleTarget[];
  summaryLabel: string;
};

const splitTemplates: Record<
  SplitType,
  Record<TrainingPlanRequest["trainingDaysPerWeek"], DaySeed[]>
> = {
  "full-body": {
    3: [
      { label: "周一", focus: "全身 A", dayType: "full_body" },
      { label: "周三", focus: "全身 B", dayType: "full_body" },
      { label: "周五", focus: "全身 C", dayType: "full_body" },
    ],
    4: [
      { label: "周一", focus: "全身 A", dayType: "full_body" },
      { label: "周二", focus: "全身 B", dayType: "full_body" },
      { label: "周四", focus: "全身 C", dayType: "full_body" },
      { label: "周六", focus: "全身 D", dayType: "full_body" },
    ],
    5: [
      { label: "周一", focus: "全身 A", dayType: "full_body" },
      { label: "周二", focus: "上肢强化", dayType: "upper" },
      { label: "周三", focus: "下肢强化", dayType: "lower" },
      { label: "周五", focus: "全身 B", dayType: "full_body" },
      { label: "周六", focus: "全身 C", dayType: "full_body" },
    ],
    6: [
      { label: "周一", focus: "全身 A", dayType: "full_body" },
      { label: "周二", focus: "上肢强化", dayType: "upper" },
      { label: "周三", focus: "下肢强化", dayType: "lower" },
      { label: "周四", focus: "Push", dayType: "push" },
      { label: "周五", focus: "Pull", dayType: "pull" },
      { label: "周六", focus: "全身补量", dayType: "full_body" },
    ],
  },
  ppl: {
    3: [
      { label: "周一", focus: "Push", dayType: "push" },
      { label: "周三", focus: "Pull", dayType: "pull" },
      { label: "周五", focus: "Legs", dayType: "legs" },
    ],
    4: [
      { label: "周一", focus: "Push", dayType: "push" },
      { label: "周二", focus: "Pull", dayType: "pull" },
      { label: "周四", focus: "Legs", dayType: "legs" },
      { label: "周六", focus: "Upper Pump", dayType: "upper" },
    ],
    5: [
      { label: "周一", focus: "Push", dayType: "push" },
      { label: "周二", focus: "Pull", dayType: "pull" },
      { label: "周三", focus: "Legs", dayType: "legs" },
      { label: "周五", focus: "Push B", dayType: "push" },
      { label: "周六", focus: "Lower Mix", dayType: "lower" },
    ],
    6: [
      { label: "周一", focus: "Push A", dayType: "push" },
      { label: "周二", focus: "Pull A", dayType: "pull" },
      { label: "周三", focus: "Legs A", dayType: "legs" },
      { label: "周四", focus: "Push B", dayType: "push" },
      { label: "周五", focus: "Pull B", dayType: "pull" },
      { label: "周六", focus: "Legs B", dayType: "legs" },
    ],
  },
  "upper-lower": {
    3: [
      { label: "周一", focus: "上肢", dayType: "upper" },
      { label: "周三", focus: "下肢", dayType: "lower" },
      { label: "周五", focus: "上肢 / 核心", dayType: "upper" },
    ],
    4: [
      { label: "周一", focus: "上肢 A", dayType: "upper" },
      { label: "周二", focus: "下肢 A", dayType: "lower" },
      { label: "周四", focus: "上肢 B", dayType: "upper" },
      { label: "周六", focus: "下肢 B", dayType: "lower" },
    ],
    5: [
      { label: "周一", focus: "上肢 A", dayType: "upper" },
      { label: "周二", focus: "下肢 A", dayType: "lower" },
      { label: "周三", focus: "上肢 B", dayType: "upper" },
      { label: "周五", focus: "下肢 B", dayType: "lower" },
      { label: "周六", focus: "上肢泵感", dayType: "upper" },
    ],
    6: [
      { label: "周一", focus: "上肢 A", dayType: "upper" },
      { label: "周二", focus: "下肢 A", dayType: "lower" },
      { label: "周三", focus: "上肢 B", dayType: "upper" },
      { label: "周四", focus: "下肢 B", dayType: "lower" },
      { label: "周五", focus: "上肢 C", dayType: "upper" },
      { label: "周六", focus: "下肢 / 核心", dayType: "lower" },
    ],
  },
  "bro-split": {
    3: [
      { label: "周一", focus: "胸肩三头", dayType: "push" },
      { label: "周三", focus: "背二头", dayType: "pull" },
      { label: "周五", focus: "腿部", dayType: "legs" },
    ],
    4: [
      { label: "周一", focus: "胸部", dayType: "chest" },
      { label: "周二", focus: "背部", dayType: "back" },
      { label: "周四", focus: "腿部", dayType: "legs" },
      { label: "周六", focus: "肩部", dayType: "shoulders" },
    ],
    5: [
      { label: "周一", focus: "胸部", dayType: "chest" },
      { label: "周二", focus: "背部", dayType: "back" },
      { label: "周三", focus: "腿部", dayType: "legs" },
      { label: "周五", focus: "肩部", dayType: "shoulders" },
      { label: "周六", focus: "手臂", dayType: "arms" },
    ],
    6: [
      { label: "周一", focus: "胸部", dayType: "chest" },
      { label: "周二", focus: "背部", dayType: "back" },
      { label: "周三", focus: "腿部", dayType: "legs" },
      { label: "周四", focus: "肩部", dayType: "shoulders" },
      { label: "周五", focus: "手臂", dayType: "arms" },
      { label: "周六", focus: "后链 / 核心", dayType: "lower" },
    ],
  },
};

const restrictionBlocks: Record<TrainingRestriction, string[]> = {
  no_squat: ["barbell_squat", "front_squat"],
  no_deadlift: ["deadlift", "romanian_deadlift"],
  no_overhead_press: ["overhead_press", "dumbbell_shoulder_press", "arnold_press"],
};

const compoundIds = new Set([
  "barbell_bench_press",
  "dumbbell_bench_press",
  "incline_dumbbell_press",
  "incline_barbell_press",
  "decline_bench_press",
  "push_up",
  "dips_chest",
  "pull_up",
  "lat_pulldown",
  "barbell_row",
  "dumbbell_row",
  "seated_cable_row",
  "deadlift",
  "t_bar_row",
  "barbell_squat",
  "front_squat",
  "leg_press",
  "romanian_deadlift",
  "lunge",
  "overhead_press",
  "dumbbell_shoulder_press",
  "arnold_press",
  "upright_row",
]);

const accessAllowMap: Record<Exclude<EquipmentAccess, "gym">, Set<string>> = {
  dumbbell: new Set([
    "dumbbell_bench_press",
    "incline_dumbbell_press",
    "dumbbell_fly",
    "push_up",
    "dips_chest",
    "pull_up",
    "dumbbell_row",
    "shrug",
    "romanian_deadlift",
    "lunge",
    "calf_raise",
    "dumbbell_shoulder_press",
    "lateral_raise",
    "front_raise",
    "reverse_fly",
    "arnold_press",
    "upright_row",
    "dumbbell_curl",
    "hammer_curl",
    "preacher_curl",
    "skull_crusher",
    "overhead_tricep_extension",
    "crunch",
    "plank",
    "russian_twist",
    "leg_raise",
    "mountain_climber",
    "bicycle_crunch",
  ]),
  bodyweight: new Set([
    "push_up",
    "dips_chest",
    "pull_up",
    "lunge",
    "calf_raise",
    "crunch",
    "plank",
    "russian_twist",
    "leg_raise",
    "mountain_climber",
    "bicycle_crunch",
  ]),
};

const repsByLevel: Record<ExperienceLevel, { compound: string; isolate: string; rest: number }> =
  {
    beginner: { compound: "8-12", isolate: "10-15", rest: 75 },
    intermediate: { compound: "6-10", isolate: "10-15", rest: 90 },
    advanced: { compound: "5-8", isolate: "8-12", rest: 105 },
  };

const countByDuration: Record<number, number> = {
  45: 4,
  60: 5,
  75: 6,
  90: 7,
};

const profileMap: Record<
  TrainingDayType,
  {
    requiredPrimaryTargets: TrainingMuscleTarget[];
    allowedSecondaryTargets: TrainingMuscleTarget[];
    forbiddenTargets: TrainingMuscleTarget[];
    minCompoundCount: number;
    minIsolationCount: number;
    coverageRules: TrainingDayTemplate["coverageRules"];
    selectionPlan: Bucket[];
    firstExerciseTargets: TrainingMuscleTarget[];
    summaryLabel: string;
  }
> = {
  chest: {
    requiredPrimaryTargets: ["chest"],
    allowedSecondaryTargets: ["triceps"],
    forbiddenTargets: ["biceps", "forearms"],
    minCompoundCount: 1,
    minIsolationCount: 1,
    coverageRules: [{ targets: ["chest"], minimum: 2, description: "need chest" }],
    selectionPlan: [
      { source: "primary", targets: ["chest"], required: true, preferCompound: true, note: "胸部主练复合动作" },
      { source: "primary", targets: ["chest"], required: true, preferCompound: true, note: "胸部第二主练动作" },
      { source: "primary", targets: ["chest"], required: false, preferCompound: false, note: "胸部补量动作" },
      { source: "secondary", targets: ["triceps"], required: false, preferCompound: false, note: "肱三头协同补充" },
    ],
    firstExerciseTargets: ["chest"],
    summaryLabel: "胸部主练日",
  },
  back: {
    requiredPrimaryTargets: ["back"],
    allowedSecondaryTargets: ["biceps"],
    forbiddenTargets: ["triceps"],
    minCompoundCount: 2,
    minIsolationCount: 1,
    coverageRules: [{ targets: ["back"], minimum: 2, description: "need back" }],
    selectionPlan: [
      { source: "primary", targets: ["back"], required: true, preferCompound: true, note: "背部主练复合动作" },
      { source: "primary", targets: ["back"], required: true, preferCompound: true, note: "背部第二主练动作" },
      { source: "primary", targets: ["back"], required: false, preferCompound: false, note: "背部补量动作" },
      { source: "secondary", targets: ["biceps"], required: false, preferCompound: false, note: "肱二头协同补充" },
    ],
    firstExerciseTargets: ["back"],
    summaryLabel: "背部主练日",
  },
  shoulders: {
    requiredPrimaryTargets: ["shoulders"],
    allowedSecondaryTargets: [],
    forbiddenTargets: ["biceps", "triceps", "forearms"],
    minCompoundCount: 0,
    minIsolationCount: 2,
    coverageRules: [{ targets: ["shoulders"], minimum: 2, description: "need shoulders" }],
    selectionPlan: [
      { source: "primary", targets: ["shoulders"], required: true, preferCompound: true, note: "肩部主练动作" },
      { source: "primary", targets: ["shoulders"], required: true, preferCompound: false, note: "肩部补强动作" },
      { source: "primary", targets: ["shoulders"], required: false, preferCompound: false, note: "肩部泵感动作" },
      { source: "primary", targets: ["back"], required: false, preferCompound: false, note: "后束与上背支持" },
    ],
    firstExerciseTargets: ["shoulders"],
    summaryLabel: "肩部主练日",
  },
  arms: {
    requiredPrimaryTargets: ["biceps", "triceps"],
    allowedSecondaryTargets: ["forearms", "core"],
    forbiddenTargets: ["chest", "back", "shoulders", "quadriceps", "hamstrings", "gluteus"],
    minCompoundCount: 0,
    minIsolationCount: 3,
    coverageRules: [
      { targets: ["biceps"], minimum: 1, description: "need biceps" },
      { targets: ["triceps"], minimum: 1, description: "need triceps" },
    ],
    selectionPlan: [
      { source: "primary", targets: ["biceps"], required: true, preferCompound: false, note: "肱二头主练动作" },
      { source: "primary", targets: ["triceps"], required: true, preferCompound: false, note: "肱三头主练动作" },
      { source: "primary", targets: ["biceps"], required: false, preferCompound: false, note: "肱二头补量动作" },
      { source: "primary", targets: ["triceps"], required: false, preferCompound: false, note: "肱三头补量动作" },
      { source: "primary", targets: ["forearms"], required: false, preferCompound: false, note: "前臂补充动作" },
    ],
    firstExerciseTargets: ["biceps", "triceps"],
    summaryLabel: "手臂强化日",
  },
  legs: {
    requiredPrimaryTargets: ["quadriceps", "gluteus", "hamstrings"],
    allowedSecondaryTargets: ["calves", "core"],
    forbiddenTargets: ["chest", "back", "shoulders", "biceps", "triceps", "forearms"],
    minCompoundCount: 2,
    minIsolationCount: 1,
    coverageRules: [
      { targets: ["quadriceps"], minimum: 1, description: "need quads" },
      { targets: ["gluteus"], minimum: 1, description: "need glutes" },
      { targets: ["hamstrings"], minimum: 1, description: "need hamstrings" },
    ],
    selectionPlan: [
      { source: "primary", targets: ["quadriceps", "gluteus"], required: true, preferCompound: true, note: "腿日前段主练动作" },
      { source: "primary", targets: ["hamstrings", "gluteus"], required: true, preferCompound: true, note: "后链主练动作" },
      { source: "primary", targets: ["quadriceps"], required: false, preferCompound: false, note: "股四头补量动作" },
      { source: "primary", targets: ["hamstrings"], required: false, preferCompound: false, note: "腿后侧补量动作" },
      { source: "secondary", targets: ["calves"], required: false, preferCompound: false, note: "小腿补充动作" },
    ],
    firstExerciseTargets: ["quadriceps", "gluteus", "hamstrings"],
    summaryLabel: "腿部覆盖日",
  },
  push: {
    requiredPrimaryTargets: ["chest", "shoulders"],
    allowedSecondaryTargets: ["triceps", "core"],
    forbiddenTargets: ["biceps", "forearms"],
    minCompoundCount: 2,
    minIsolationCount: 1,
    coverageRules: [
      { targets: ["chest"], minimum: 1, description: "need chest" },
      { targets: ["shoulders"], minimum: 1, description: "need shoulders" },
    ],
    selectionPlan: [
      { source: "primary", targets: ["chest"], required: true, preferCompound: true, note: "推日胸部主练动作" },
      { source: "primary", targets: ["shoulders"], required: true, preferCompound: true, note: "推日肩部主练动作" },
      { source: "primary", targets: ["chest", "shoulders"], required: false, preferCompound: false, note: "推日补量动作" },
      { source: "secondary", targets: ["triceps"], required: false, preferCompound: false, note: "肱三头协同补充" },
    ],
    firstExerciseTargets: ["chest", "shoulders"],
    summaryLabel: "推日",
  },
  pull: {
    requiredPrimaryTargets: ["back"],
    allowedSecondaryTargets: ["biceps", "forearms", "core"],
    forbiddenTargets: ["triceps"],
    minCompoundCount: 2,
    minIsolationCount: 1,
    coverageRules: [{ targets: ["back"], minimum: 2, description: "need back" }],
    selectionPlan: [
      { source: "primary", targets: ["back"], required: true, preferCompound: true, note: "拉日背部主练动作" },
      { source: "primary", targets: ["back"], required: true, preferCompound: true, note: "拉日第二主练动作" },
      { source: "primary", targets: ["back", "shoulders"], required: false, preferCompound: false, note: "拉日上背补量动作" },
      { source: "secondary", targets: ["biceps"], required: false, preferCompound: false, note: "肱二头协同补充" },
    ],
    firstExerciseTargets: ["back"],
    summaryLabel: "拉日",
  },
  upper: {
    requiredPrimaryTargets: ["chest", "back", "shoulders"],
    allowedSecondaryTargets: ["biceps", "triceps", "core"],
    forbiddenTargets: ["quadriceps", "hamstrings", "gluteus", "calves"],
    minCompoundCount: 2,
    minIsolationCount: 1,
    coverageRules: [
      { targets: ["chest"], minimum: 1, description: "need chest" },
      { targets: ["back"], minimum: 1, description: "need back" },
      { targets: ["shoulders"], minimum: 1, description: "need shoulders" },
    ],
    selectionPlan: [
      { source: "primary", targets: ["chest"], required: true, preferCompound: true, note: "上肢日胸部主练动作" },
      { source: "primary", targets: ["back"], required: true, preferCompound: true, note: "上肢日背部主练动作" },
      { source: "primary", targets: ["shoulders"], required: true, preferCompound: false, note: "上肢日肩部补强动作" },
      { source: "primary", targets: ["chest", "back"], required: false, preferCompound: false, note: "上肢日补量动作" },
      { source: "secondary", targets: ["biceps", "triceps"], required: false, preferCompound: false, note: "手臂协同补充" },
    ],
    firstExerciseTargets: ["chest", "back"],
    summaryLabel: "上肢综合日",
  },
  lower: {
    requiredPrimaryTargets: ["quadriceps", "gluteus", "hamstrings"],
    allowedSecondaryTargets: ["calves", "core"],
    forbiddenTargets: ["chest", "back", "shoulders", "biceps", "triceps", "forearms"],
    minCompoundCount: 2,
    minIsolationCount: 1,
    coverageRules: [
      { targets: ["quadriceps"], minimum: 1, description: "need quads" },
      { targets: ["gluteus"], minimum: 1, description: "need glutes" },
      { targets: ["hamstrings"], minimum: 1, description: "need hamstrings" },
    ],
    selectionPlan: [
      { source: "primary", targets: ["quadriceps", "gluteus"], required: true, preferCompound: true, note: "下肢日前段主练动作" },
      { source: "primary", targets: ["hamstrings", "gluteus"], required: true, preferCompound: true, note: "下肢日后链主练动作" },
      { source: "primary", targets: ["quadriceps"], required: false, preferCompound: false, note: "股四头补量动作" },
      { source: "primary", targets: ["hamstrings"], required: false, preferCompound: false, note: "腿后侧补量动作" },
      { source: "secondary", targets: ["calves"], required: false, preferCompound: false, note: "小腿补充动作" },
    ],
    firstExerciseTargets: ["quadriceps", "gluteus", "hamstrings"],
    summaryLabel: "下肢综合日",
  },
  full_body: {
    requiredPrimaryTargets: ["quadriceps", "chest", "back"],
    allowedSecondaryTargets: ["gluteus", "hamstrings", "shoulders", "core"],
    forbiddenTargets: ["biceps", "triceps", "forearms"],
    minCompoundCount: 2,
    minIsolationCount: 1,
    coverageRules: [
      { targets: ["quadriceps", "gluteus", "hamstrings"], minimum: 1, description: "need lower body" },
      { targets: ["chest", "back"], minimum: 2, description: "need push and pull" },
    ],
    selectionPlan: [
      { source: "primary", targets: ["quadriceps", "gluteus"], required: true, preferCompound: true, note: "全身日下肢主练动作" },
      { source: "primary", targets: ["chest", "back"], required: true, preferCompound: true, note: "全身日上肢主练动作" },
      { source: "primary", targets: ["back", "chest", "shoulders"], required: false, preferCompound: true, note: "全身日上肢补量动作" },
      { source: "primary", targets: ["hamstrings", "gluteus"], required: false, preferCompound: false, note: "全身日后链补充动作" },
      { source: "secondary", targets: ["shoulders", "core"], required: false, preferCompound: false, note: "全身日辅助动作" },
    ],
    firstExerciseTargets: ["quadriceps", "gluteus", "hamstrings"],
    summaryLabel: "全身训练日",
  },
};

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function intersects(source: TrainingMuscleTarget[], targets: TrainingMuscleTarget[]) {
  return targets.some((target) => source.includes(target));
}

function getTargets(muscleIds: string[], category: string) {
  const targets = new Set<TrainingMuscleTarget>();
  for (const muscleId of muscleIds) {
    if (["upper_chest", "middle_chest", "lower_chest"].includes(muscleId)) targets.add("chest");
    if (["latissimus", "rhomboid", "trapezius", "erector_spinae"].includes(muscleId)) targets.add("back");
    if (["anterior_deltoid", "lateral_deltoid", "posterior_deltoid"].includes(muscleId)) targets.add("shoulders");
    if (muscleId === "biceps") targets.add("biceps");
    if (muscleId === "triceps") targets.add("triceps");
    if (muscleId === "forearms") targets.add("forearms");
    if (muscleId === "quadriceps") targets.add("quadriceps");
    if (muscleId === "hamstrings") targets.add("hamstrings");
    if (muscleId === "gluteus") targets.add("gluteus");
    if (muscleId === "calves") targets.add("calves");
    if (["abdominals", "obliques"].includes(muscleId)) targets.add("core");
  }
  if (category === "core") targets.add("core");
  return [...targets];
}

function isEquipmentAllowed(exerciseId: string, access: EquipmentAccess) {
  return access === "gym" ? true : accessAllowMap[access].has(exerciseId);
}

function matchesLevel(
  exercise: Pick<ExerciseCandidate, "difficulty" | "compound">,
  level: ExperienceLevel,
) {
  if (level === "advanced") return true;
  if (level === "beginner") {
    return exercise.difficulty === "beginner" || exercise.difficulty === "intermediate";
  }
  return exercise.difficulty !== "advanced" || exercise.compound;
}

function scoreExercise(exercise: ExerciseCandidate, template: RuleTemplate, bucket: Bucket) {
  let score = 0;
  score += bucket.targets.filter((target) => exercise.primaryTargets.includes(target)).length * 40;
  score += bucket.targets.filter((target) => exercise.allTargets.includes(target)).length * 10;
  score += bucket.preferCompound ? (exercise.compound ? 20 : 4) : exercise.compound ? 4 : 18;
  if (intersects(exercise.primaryTargets, template.requiredPrimaryTargets)) score += 10;
  if (intersects(exercise.primaryTargets, ["chest", "back", "quadriceps", "gluteus", "hamstrings"])) score += 5;
  return score;
}

function buildTemplate(seed: DaySeed): RuleTemplate {
  return { ...seed, ...profileMap[seed.dayType] };
}

export async function loadEligibleExercises(
  request: TrainingPlanRequest,
): Promise<ExerciseCandidate[]> {
  const exerciseRows = (await db.select().from(exercises)) as ExerciseRecord[];
  const muscleRows = await db
    .select({
      exerciseId: exerciseMuscles.exerciseId,
      role: exerciseMuscles.role,
      muscleSlug: muscles.slug,
    })
    .from(exerciseMuscles)
    .innerJoin(muscles, eq(exerciseMuscles.muscleId, muscles.id));

  const linkMap = new Map<string, Array<{ role: string; muscleSlug: string }>>();
  for (const row of muscleRows) {
    const list = linkMap.get(row.exerciseId) ?? [];
    list.push({ role: row.role, muscleSlug: row.muscleSlug });
    linkMap.set(row.exerciseId, list);
  }

  const blocked = new Set(
    request.restrictions.flatMap((restriction) => restrictionBlocks[restriction]),
  );

  return exerciseRows
    .map((exercise) => {
      const links = linkMap.get(exercise.id) ?? [];
      const primaryMuscleIds = unique(
        links.filter((item) => item.role === "primary").map((item) => item.muscleSlug),
      );
      const secondaryMuscleIds = unique(
        links.filter((item) => item.role === "secondary").map((item) => item.muscleSlug),
      );
      const primaryTargets = getTargets(primaryMuscleIds, exercise.category);
      const secondaryTargets = getTargets(secondaryMuscleIds, exercise.category);
      return {
        ...exercise,
        primaryMuscleIds,
        secondaryMuscleIds,
        primaryTargets,
        allTargets: unique([...primaryTargets, ...secondaryTargets]),
        compound: compoundIds.has(exercise.id),
      };
    })
    .filter(
      (exercise) =>
        !blocked.has(exercise.id) &&
        isEquipmentAllowed(exercise.id, request.equipmentAccess) &&
        matchesLevel(exercise, request.experienceLevel),
    );
}

export function getTrainingDayTemplates(request: TrainingPlanRequest) {
  return splitTemplates[request.splitType][request.trainingDaysPerWeek].map(
    buildTemplate,
  );
}

export function partitionExercisesForDay(
  pool: ExerciseCandidate[],
  template: TrainingDayTemplate,
) {
  const available = pool.filter(
    (exercise) => !exercise.excludedDays.includes(template.dayType),
  );
  return {
    primary: available.filter((exercise) => exercise.primaryDays.includes(template.dayType)),
    secondary: available.filter((exercise) =>
      exercise.secondaryDays.includes(template.dayType),
    ),
  };
}

export function validateDayCoverage(
  selected: ExerciseCandidate[],
  template: RuleTemplate,
): TrainingDayConstraintResult {
  const reasons: string[] = [];
  const missingTargets: TrainingMuscleTarget[] = [];

  if (selected.filter((exercise) => exercise.compound).length < template.minCompoundCount) {
    reasons.push("compound count too low");
  }
  if (selected.filter((exercise) => !exercise.compound).length < template.minIsolationCount) {
    reasons.push("isolation count too low");
  }

  for (const rule of template.coverageRules) {
    const count = selected.filter((exercise) =>
      intersects(exercise.primaryTargets, rule.targets),
    ).length;
    if (count < rule.minimum) {
      reasons.push(rule.description);
      for (const target of rule.targets) {
        if (!selected.some((exercise) => exercise.primaryTargets.includes(target))) {
          missingTargets.push(target);
        }
      }
    }
  }

  if (
    !selected[0] ||
    !intersects(selected[0].primaryTargets, template.firstExerciseTargets)
  ) {
    reasons.push("first exercise mismatch");
    missingTargets.push(...template.firstExerciseTargets);
  }

  return { isValid: reasons.length === 0, missingTargets: unique(missingTargets), reasons };
}

function pickFromBucket(
  pool: ExerciseCandidate[],
  template: RuleTemplate,
  bucket: Bucket,
  usedIds: Set<string>,
) {
  return (
    pool
      .filter((exercise) => !usedIds.has(exercise.id))
      .filter((exercise) => !intersects(exercise.primaryTargets, template.forbiddenTargets))
      .filter((exercise) => intersects(exercise.primaryTargets, bucket.targets))
      .sort((a, b) => scoreExercise(b, template, bucket) - scoreExercise(a, template, bucket))[0] ??
    null
  );
}

function buildDraft(
  exercise: ExerciseCandidate,
  orderIndex: number,
  level: ExperienceLevel,
  duration: number,
  note: string,
) {
  const preset = repsByLevel[level];
  const sets = exercise.compound ? (orderIndex === 0 ? 4 : 3) : duration <= 45 && orderIndex >= 3 ? 2 : 3;
  return {
    sets,
    reps: exercise.compound ? preset.compound : preset.isolate,
    restSeconds: exercise.compound ? preset.rest : Math.max(45, preset.rest - 30),
    notes:
      orderIndex === 0
        ? `${note}，放在最前面，优先保证动作质量。`
        : exercise.compound
          ? `${note}，保持稳定节奏完成。`
          : `${note}，聚焦目标肌群发力。`,
  };
}

export function buildDayExercises(
  pool: ExerciseCandidate[],
  template: RuleTemplate,
  request: TrainingPlanRequest,
) {
  const { primary, secondary } = partitionExercisesForDay(pool, template);
  const selected: ExerciseCandidate[] = [];
  const usedIds = new Set<string>();
  const noteMap = new Map<string, string>();
  const maxCount = countByDuration[request.sessionDurationMinutes] ?? 5;

  for (const bucket of template.selectionPlan) {
    if (selected.length >= maxCount) break;
    const chosen = pickFromBucket(
      bucket.source === "primary" ? primary : secondary,
      template,
      bucket,
      usedIds,
    );
    if (!chosen) continue;
    selected.push(chosen);
    usedIds.add(chosen.id);
    noteMap.set(chosen.id, bucket.note);
  }

  const accessoryPool = [
    ...primary.filter((exercise) =>
      intersects(exercise.primaryTargets, template.requiredPrimaryTargets),
    ),
    ...secondary.filter((exercise) =>
      intersects(exercise.primaryTargets, template.allowedSecondaryTargets),
    ),
  ]
    .filter((exercise) => !usedIds.has(exercise.id))
    .filter((exercise) => !intersects(exercise.primaryTargets, template.forbiddenTargets))
    .sort((a, b) => Number(b.compound) - Number(a.compound));

  for (const exercise of accessoryPool) {
    if (selected.length >= maxCount) break;
    selected.push(exercise);
    usedIds.add(exercise.id);
    noteMap.set(exercise.id, "补充当天训练量");
  }

  const validation = validateDayCoverage(selected, template);
  if (!validation.isValid && selected.length < maxCount) {
    for (const target of validation.missingTargets) {
      const fix = primary
        .filter((exercise) => !usedIds.has(exercise.id))
        .filter((exercise) => exercise.primaryTargets.includes(target))
        .filter((exercise) => !intersects(exercise.primaryTargets, template.forbiddenTargets))
        .sort((a, b) => Number(b.compound) - Number(a.compound))[0];
      if (!fix || selected.length >= maxCount) continue;
      selected.push(fix);
      usedIds.add(fix.id);
      noteMap.set(fix.id, "为满足当天覆盖要求补充");
    }
  }

  return {
    summary: `${template.summaryLabel}，先做复合动作，再做孤立补量，并避开不属于当天的无关手臂孤立动作。`,
    exercises: selected.slice(0, maxCount).map((exercise, index) => {
      const draft = buildDraft(
        exercise,
        index,
        request.experienceLevel,
        request.sessionDurationMinutes,
        noteMap.get(exercise.id) ?? "当天补充动作",
      );
      return {
        id: `draft-${template.dayType}-${index + 1}`,
        exerciseId: exercise.id,
        name: exercise.name,
        category: exercise.category,
        sets: draft.sets,
        reps: draft.reps,
        restSeconds: draft.restSeconds,
        notes: draft.notes,
      };
    }),
  };
}

export async function generateTrainingPlanFromRules(
  request: TrainingPlanRequest,
) {
  const pool = await loadEligibleExercises(request);
  const templates = getTrainingDayTemplates(request);

  const days = templates.map((template, dayIndex) => {
    const built = buildDayExercises(pool, template, request);
    const parsed = trainingPlanDayDraftSchema.parse({
      label: template.label,
      focus: template.focus,
      summary: built.summary,
      exercises: built.exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        sets: exercise.sets,
        reps: exercise.reps,
        restSeconds: exercise.restSeconds,
        notes: exercise.notes,
      })),
    });
    return {
      label: parsed.label,
      focus: parsed.focus,
      summary: parsed.summary,
      exercises: built.exercises.map((exercise, index) => ({
        id: `draft-${dayIndex + 1}-${index + 1}`,
        exerciseId: exercise.exerciseId,
        name: exercise.name,
        category: exercise.category,
        sets: exercise.sets,
        reps: exercise.reps,
        restSeconds: exercise.restSeconds,
        notes: exercise.notes,
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

  const splitLabelMap: Record<SplitType, string> = {
    ppl: "PPL",
    "upper-lower": "上肢 / 下肢",
    "full-body": "全身",
    "bro-split": "分部位",
  };

  const equipmentLabelMap: Record<EquipmentAccess, string> = {
    gym: "完整健身房",
    dumbbell: "哑铃 / 基础器械",
    bodyweight: "徒手训练",
  };

  const experienceLabelMap: Record<ExperienceLevel, string> = {
    beginner: "新手",
    intermediate: "中级",
    advanced: "高级",
  };

  return {
    title: `${goalLabel}${request.trainingDaysPerWeek}天${splitLabelMap[request.splitType]}训练计划`,
    summary: `基于 ${experienceLabelMap[request.experienceLevel]} 水平、${equipmentLabelMap[request.equipmentAccess]} 条件和每次 ${request.sessionDurationMinutes} 分钟时长生成的一周训练安排，优先保证每天的主练肌群与协同逻辑正确。`,
    weeklySchedule: days.map((day) => `${day.label} / ${day.focus}`),
    days,
  };
}
