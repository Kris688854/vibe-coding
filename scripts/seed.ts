import { sql } from "drizzle-orm";
import { db } from "../src/lib/db/client";
import { exerciseMuscles, exercises, muscles } from "../src/lib/db/schema";
import { seedData } from "../src/lib/db/seed-data";

async function main() {
  for (const muscle of seedData.muscles) {
    await db
      .insert(muscles)
      .values(muscle)
      .onConflictDoUpdate({
        target: muscles.id,
        set: muscle,
      });
  }

  for (const exercise of seedData.exercises) {
    await db
      .insert(exercises)
      .values(exercise)
      .onConflictDoUpdate({
        target: exercises.id,
        set: {
          slug: exercise.slug,
          name: exercise.name,
          nameEn: exercise.nameEn,
          category: exercise.category,
          difficulty: exercise.difficulty,
          description: exercise.description,
          instructions: exercise.instructions,
          equipment: exercise.equipment,
          primaryDays: exercise.primaryDays,
          secondaryDays: exercise.secondaryDays,
          excludedDays: exercise.excludedDays,
          heroMeshKeys: exercise.heroMeshKeys,
        },
      });
  }

  await db.delete(exerciseMuscles);

  for (const link of seedData.exerciseMuscles) {
    await db.insert(exerciseMuscles).values(link);
  }

  console.log(
    `Seeded ${seedData.muscles.length} muscles, ${seedData.exercises.length} exercises and ${seedData.exerciseMuscles.length} relations.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
