import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { getDashboardOverviewData } from "@/server/services/dashboard-service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardOverviewData();

  return (
    <main className="app-shell px-4 py-6 md:px-6">
      <div className="mx-auto max-w-[1480px]">
        <DashboardOverview data={data} />
      </div>
    </main>
  );
}
