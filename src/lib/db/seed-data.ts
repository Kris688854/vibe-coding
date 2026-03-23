import legacyExercises from "@/lib/data/legacy-exercises.json";
import legacyMuscles from "@/lib/data/legacy-muscles.json";
import { CATEGORY_META } from "@/lib/constants/exercise-taxonomy";
import { MUSCLE_MESH_MAP } from "@/lib/constants/muscle-mesh-map";
import type {
  ExerciseDayRuleMetadata,
  TrainingDayType,
} from "@/features/training-plan/types";

const muscleIdAliases: Record<string, string> = {
  brachialis: "biceps",
};

const shoulderCompoundIds = new Set([
  "overhead_press",
  "dumbbell_shoulder_press",
  "arnold_press",
  "upright_row",
]);

const shoulderAccessoryIds = new Set(["face_pull", "reverse_fly", "shrug"]);

type LegacyMuscle = {
  id: string;
  name: string;
  name_en: string;
  category: string;
  color: string;
};

type LegacyExercise = {
  id: string;
  name: string;
  name_en: string;
  category: string;
  difficulty: string;
  equipment: string[];
  description: string;
  muscles: {
    primary: string[];
    secondary: string[];
  };
};

function unique<T>(items: T[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function resolveMuscleId(muscleId: string) {
  return muscleIdAliases[muscleId] ?? muscleId;
}

function buildInstructions(exercise: LegacyExercise) {
  const shared = [
    "先用 1 到 2 组轻重量热身，确认关节活动范围顺畅。",
    "全程保持核心收紧，离心阶段控制速度，避免借力甩动。",
    "组间休息 60 到 90 秒，最后 1 到 2 组接近力竭但保持动作质量。",
  ];

  if (exercise.category === "legs") {
    return [
      "起始站稳并让膝盖与脚尖方向一致，先建立下肢发力节奏。",
      "下降时维持躯干稳定，发力时从脚底均匀推地站起。",
      shared[2],
    ];
  }

  if (exercise.category === "back") {
    return [
      "启动前先沉肩收紧肩胛，避免耸肩抢动作。",
      "把肘部朝目标方向带动，而不是只想着拉重量。",
      shared[2],
    ];
  }

  return shared;
}

function buildDayRuleMetadata(exercise: LegacyExercise): ExerciseDayRuleMetadata {
  const primaryMuscles = exercise.muscles.primary.map(resolveMuscleId);
  const primarySet = new Set(primaryMuscles);

  const metadata: ExerciseDayRuleMetadata = {
    primaryDays: [],
    secondaryDays: [],
    excludedDays: [],
  };

  const pushPrimaryDays: TrainingDayType[] = [
    "chest",
    "push",
    "upper",
    "full_body",
  ];
  const pullPrimaryDays: TrainingDayType[] = [
    "back",
    "pull",
    "upper",
    "full_body",
  ];
  const lowerPrimaryDays: TrainingDayType[] = ["legs", "lower", "full_body"];

  switch (exercise.category) {
    case "chest":
      metadata.primaryDays = pushPrimaryDays;
      metadata.secondaryDays = ["shoulders"];
      metadata.excludedDays = ["back", "pull", "arms", "legs", "lower"];
      break;
    case "back":
      if (exercise.id === "deadlift") {
        metadata.primaryDays = ["back", "pull", "lower", "full_body"];
        metadata.secondaryDays = ["legs"];
        metadata.excludedDays = ["chest", "push", "arms"];
        break;
      }

      if (exercise.id === "face_pull") {
        metadata.primaryDays = ["back", "pull", "shoulders"];
        metadata.secondaryDays = ["upper", "full_body"];
        metadata.excludedDays = ["chest", "push", "arms", "legs", "lower"];
        break;
      }

      if (exercise.id === "shrug") {
        metadata.primaryDays = ["back", "pull", "shoulders"];
        metadata.secondaryDays = ["upper"];
        metadata.excludedDays = ["chest", "push", "arms", "legs", "lower"];
        break;
      }

      metadata.primaryDays = pullPrimaryDays;
      metadata.secondaryDays = ["shoulders"];
      metadata.excludedDays = ["chest", "push", "arms"];
      break;
    case "legs":
      if (exercise.id === "calf_raise") {
        metadata.primaryDays = [];
        metadata.secondaryDays = lowerPrimaryDays;
      } else {
        metadata.primaryDays = lowerPrimaryDays;
        metadata.secondaryDays = primarySet.has("quadriceps")
          ? ["full_body"]
          : primarySet.has("hamstrings") || primarySet.has("gluteus")
            ? ["back", "pull"]
            : [];
      }
      metadata.excludedDays = ["chest", "back", "shoulders", "arms", "push", "pull", "upper"];
      break;
    case "shoulders":
      metadata.primaryDays = shoulderCompoundIds.has(exercise.id)
        ? ["shoulders", "push", "upper", "full_body"]
        : ["shoulders"];
      metadata.secondaryDays = shoulderAccessoryIds.has(exercise.id)
        ? ["back", "pull", "upper", "full_body"]
        : ["push", "upper", "full_body"];
      metadata.excludedDays = ["chest", "back", "arms", "legs", "lower"];
      break;
    case "arms":
      if (primarySet.has("biceps")) {
        metadata.primaryDays = ["arms"];
        metadata.secondaryDays = ["back", "pull", "upper"];
        metadata.excludedDays = ["chest", "push", "shoulders", "legs", "lower", "full_body"];
      } else if (primarySet.has("triceps")) {
        metadata.primaryDays = ["arms"];
        metadata.secondaryDays = ["chest", "push", "upper"];
        metadata.excludedDays = ["back", "pull", "shoulders", "legs", "lower", "full_body"];
      } else {
        metadata.primaryDays = ["arms"];
        metadata.secondaryDays = ["back", "pull", "upper"];
        metadata.excludedDays = ["chest", "push", "shoulders", "legs", "lower", "full_body"];
      }
      break;
    case "core":
      metadata.primaryDays = [];
      metadata.secondaryDays = ["push", "pull", "upper", "lower", "legs", "full_body"];
      metadata.excludedDays = [];
      break;
    default:
      metadata.primaryDays = [];
      metadata.secondaryDays = [];
      metadata.excludedDays = [];
  }

  metadata.primaryDays = unique(metadata.primaryDays);
  metadata.secondaryDays = unique(
    metadata.secondaryDays.filter((day) => !metadata.primaryDays.includes(day)),
  );
  metadata.excludedDays = unique(
    metadata.excludedDays.filter(
      (day) =>
        !metadata.primaryDays.includes(day) &&
        !metadata.secondaryDays.includes(day),
    ),
  );

  return metadata;
}

const muscles = (legacyMuscles as LegacyMuscle[]).map((muscle, index) => ({
  id: muscle.id,
  slug: muscle.id,
  name: muscle.name,
  nameEn: muscle.name_en,
  category: muscle.category,
  color: muscle.color,
  primaryMeshKeys: MUSCLE_MESH_MAP[muscle.id]?.primaryMeshKeys ?? ["BODY"],
  secondaryMeshKeys: MUSCLE_MESH_MAP[muscle.id]?.secondaryMeshKeys ?? ["BODY"],
  sortOrder: index + 1,
}));

const muscleLookup = new Map(muscles.map((muscle) => [muscle.id, muscle]));

const exercises = (legacyExercises as LegacyExercise[]).map((exercise) => {
  const primaryMuscles = exercise.muscles.primary.map(resolveMuscleId);
  const heroMeshKeys = unique(
    primaryMuscles.flatMap(
      (muscleId) => muscleLookup.get(muscleId)?.primaryMeshKeys ?? ["BODY"],
    ),
  );
  const dayRules = buildDayRuleMetadata(exercise);

  return {
    id: exercise.id,
    slug: exercise.id,
    name: exercise.name,
    nameEn: exercise.name_en,
    category: exercise.category,
    difficulty: exercise.difficulty,
    description: exercise.description,
    instructions: buildInstructions(exercise),
    equipment: unique(exercise.equipment),
    primaryDays: dayRules.primaryDays,
    secondaryDays: dayRules.secondaryDays,
    excludedDays: dayRules.excludedDays,
    heroMeshKeys,
    createdAt: new Date().toISOString(),
  };
});

const exerciseMuscles = (legacyExercises as LegacyExercise[]).flatMap((exercise) => {
  const primary = exercise.muscles.primary.map((muscleId) => ({
    exerciseId: exercise.id,
    muscleId: resolveMuscleId(muscleId),
    role: "primary",
  }));

  const secondary = exercise.muscles.secondary.map((muscleId) => ({
    exerciseId: exercise.id,
    muscleId: resolveMuscleId(muscleId),
    role: "secondary",
  }));

  return [...primary, ...secondary].filter((link) =>
    muscleLookup.has(link.muscleId),
  );
});

export const seedData = {
  categories: Object.values(CATEGORY_META),
  muscles,
  exercises,
  exerciseMuscles,
};
