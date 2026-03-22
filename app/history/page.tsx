import { HistoryDashboard } from "@/features/history/components/history-dashboard";
import {
  listBodyMetrics,
  listNutritionHistory,
  listTrainingHistory,
} from "@/server/services/history-service";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const [initialNutrition, initialTraining, initialBodyMetrics] =
    await Promise.all([
      listNutritionHistory(),
      listTrainingHistory(),
      listBodyMetrics(),
    ]);

  return (
    <main className="app-shell px-4 py-6 md:px-6">
      <div className="mx-auto max-w-[1480px]">
        <HistoryDashboard
          initialNutrition={initialNutrition}
          initialTraining={initialTraining}
          initialBodyMetrics={initialBodyMetrics}
        />
      </div>
    </main>
  );
}
