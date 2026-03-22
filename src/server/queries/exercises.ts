import { eq, inArray } from "drizzle-orm";
import type {
  ExerciseCatalogResponse,
  ExerciseDetail,
  ExerciseListItem,
  MuscleSummary,
} from "@/features/exercises/types";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/constants/exercise-taxonomy";
import { db } from "@/lib/db/client";
import { exerciseMuscles, exercises, muscles } from "@/lib/db/schema";

function dedupe(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

export async function getExerciseCatalog(
  category?: string,
): Promise<ExerciseCatalogResponse> {
  const rawExercises = await db.select().from(exercises);
  const selectedCategory =
    category && CATEGORY_ORDER.includes(category as never)
      ? category
      : rawExercises[0]?.category ?? CATEGORY_ORDER[0];

  const filtered = rawExercises
    .filter((exercise) => exercise.category === selectedCategory)
    .sort((left, right) => left.name.localeCompare(right.name, "zh-CN"));

  const exerciseList: ExerciseListItem[] = filtered.map((exercise) => ({
    id: exercise.id,
    slug: exercise.slug,
    name: exercise.name,
    nameEn: exercise.nameEn,
    category: exercise.category,
    difficulty: exercise.difficulty,
    equipment: exercise.equipment,
  }));

  const categories = CATEGORY_ORDER.map((categoryId) => ({
    id: categoryId,
    label: CATEGORY_META[categoryId].label,
    labelEn: CATEGORY_META[categoryId].labelEn,
    icon: CATEGORY_META[categoryId].icon,
    count: rawExercises.filter((exercise) => exercise.category === categoryId).length,
  }));

  return {
    categories,
    selectedCategory,
    defaultSelectedId: exerciseList[0]?.id ?? null,
    exercises: exerciseList,
  };
}

export async function getExerciseDetailById(
  exerciseId: string,
): Promise<ExerciseDetail | null> {
  const [exercise] = await db
    .select()
    .from(exercises)
    .where(eq(exercises.id, exerciseId));

  if (!exercise) {
    return null;
  }

  const links = await db
    .select()
    .from(exerciseMuscles)
    .where(eq(exerciseMuscles.exerciseId, exercise.id));

  const muscleIds = links.map((link) => link.muscleId);
  const relatedMuscles = muscleIds.length
    ? await db.select().from(muscles).where(inArray(muscles.id, muscleIds))
    : [];

  const muscleLookup = new Map(relatedMuscles.map((muscle) => [muscle.id, muscle]));

  const primaryMuscles: MuscleSummary[] = links
    .filter((link) => link.role === "primary")
    .map((link) => muscleLookup.get(link.muscleId))
    .filter(Boolean)
    .map((muscle) => ({
      id: muscle!.id,
      slug: muscle!.slug,
      name: muscle!.name,
      nameEn: muscle!.nameEn,
      category: muscle!.category,
      color: muscle!.color,
    }));

  const secondaryMuscles: MuscleSummary[] = links
    .filter((link) => link.role === "secondary")
    .map((link) => muscleLookup.get(link.muscleId))
    .filter(Boolean)
    .map((muscle) => ({
      id: muscle!.id,
      slug: muscle!.slug,
      name: muscle!.name,
      nameEn: muscle!.nameEn,
      category: muscle!.category,
      color: muscle!.color,
    }));

  const primaryMeshKeys = dedupe(
    links
      .filter((link) => link.role === "primary")
      .flatMap((link) => muscleLookup.get(link.muscleId)?.primaryMeshKeys ?? []),
  );

  const secondaryMeshKeys = dedupe(
    links
      .filter((link) => link.role === "secondary")
      .flatMap((link) => {
        const muscle = muscleLookup.get(link.muscleId);
        return muscle?.secondaryMeshKeys?.length
          ? muscle.secondaryMeshKeys
          : muscle?.primaryMeshKeys ?? [];
      }),
  );

  return {
    id: exercise.id,
    slug: exercise.slug,
    name: exercise.name,
    nameEn: exercise.nameEn,
    category: exercise.category,
    difficulty: exercise.difficulty,
    equipment: exercise.equipment,
    description: exercise.description,
    instructions: exercise.instructions,
    heroMeshKeys: exercise.heroMeshKeys,
    primaryMuscles,
    secondaryMuscles,
    primaryMeshKeys,
    secondaryMeshKeys,
  };
}
