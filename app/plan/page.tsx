import { TrainingPlanBuilder } from "@/features/training-plan/components/training-plan-builder";
import { listTrainingPlans } from "@/server/services/training-plan-service";

export const dynamic = "force-dynamic";

export default async function PlanPage() {
  const initialPlans = await listTrainingPlans();

  return (
    <main className="app-shell px-4 py-6 md:px-6">
      <div className="mx-auto max-w-[1480px]">
        <TrainingPlanBuilder initialPlans={initialPlans} />
      </div>
    </main>
  );
}
