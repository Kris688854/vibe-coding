import { NutritionPlanner } from "@/features/nutrition/components/nutrition-planner";

export default function NutritionPage() {
  return (
    <main className="app-shell px-4 py-6 md:px-6">
      <div className="mx-auto max-w-[1440px]">
        <NutritionPlanner />
      </div>
    </main>
  );
}
