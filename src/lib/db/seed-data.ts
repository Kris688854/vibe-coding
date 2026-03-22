import legacyExercises from "@/lib/data/legacy-exercises.json";
import legacyMuscles from "@/lib/data/legacy-muscles.json";
import { CATEGORY_META } from "@/lib/constants/exercise-taxonomy";
import { MUSCLE_MESH_MAP } from "@/lib/constants/muscle-mesh-map";

const muscleIdAliases: Record<string, string> = {
  brachialis: "biceps",
};

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

function unique(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function resolveMuscleId(muscleId: string) {
  return muscleIdAliases[muscleId] ?? muscleId;
}

function buildInstructions(exercise: LegacyExercise) {
  const shared = [
    "先用 1 至 2 组轻重量热身，确认关节活动范围顺畅。",
    "全程保持核心收紧，离心阶段控制速度，避免借力甩动。",
    "组间休息 60 到 90 秒，最后 2 次重复保持动作质量。",
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

