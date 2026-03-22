import { ExercisesDashboard } from "@/features/exercises/components/exercises-dashboard";
import {
  getExerciseCatalog,
  getExerciseDetailById,
} from "@/server/queries/exercises";

export const dynamic = "force-dynamic";

export default async function ExercisesPage() {
  const initialCatalog = await getExerciseCatalog();
  const initialDetail = initialCatalog.defaultSelectedId
    ? await getExerciseDetailById(initialCatalog.defaultSelectedId)
    : null;

  return (
    <main className="app-shell px-4 py-6 md:px-6">
      <div className="mx-auto max-w-[1480px]">
        <ExercisesDashboard
          initialCatalog={initialCatalog}
          initialDetail={initialDetail}
        />
      </div>
    </main>
  );
}

