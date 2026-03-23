import { HumanBodyViewer } from "@/components/3d/human-body-viewer";
import { Pill } from "@/components/ui/pill";
import type { DashboardOverviewData } from "@/features/dashboard/types";

type DashboardOverviewProps = {
  data: DashboardOverviewData;
};

function formatDate(value: string) {
  return value.slice(5, 10);
}

function formatGoal(goal: string) {
  const map: Record<string, string> = {
    fat_loss: "减脂",
    maintenance: "维持",
    muscle_gain: "增肌",
    bulk: "增肌期",
    cut: "减脂期",
    maintain: "维持状态",
    recomp: "体态重组",
  };

  return map[goal] ?? goal;
}

function getBarHeight(value: number, maxValue: number) {
  if (maxValue <= 0) {
    return 24;
  }

  return Math.max(24, Math.round((value / maxValue) * 160));
}

export function DashboardOverview({ data }: DashboardOverviewProps) {
  const topScore = data.weeklyHeatmap.muscles[0]?.score ?? 0;
  const weightValues = data.bodyMetricTrend.map((item) => item.weightKg);
  const maxWeight = Math.max(...weightValues, 0);
  const nutritionCalories = data.nutritionTrend.map((item) => item.targetCalories);
  const maxCalories = Math.max(...nutritionCalories, 0);

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/25 bg-hero-grid p-6 text-white shadow-panel">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-200">
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold">本周覆盖与近期趋势</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-200">
          统一查看最近训练计划带来的肌群覆盖热力、体重变化，以及近期营养目标的调整趋势。
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.95fr)]">
        <section className="overflow-hidden rounded-[28px] border border-white/25 bg-[linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(2,6,23,1))] shadow-panel">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_34%)] p-6 text-white">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.24em] text-orange-200">
                Weekly Heatmap
              </p>
              <h2 className="mt-2 text-2xl font-bold">本周肌群覆盖热力图</h2>
              <p className="mt-2 text-sm text-slate-200">
                当前按最近一次训练计划估算本周刺激。主肌群按 1.0 权重，次肌群按
                0.5 权重，并结合动作组数累计成 score。
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Pill className="bg-white/15 text-white">
                周期 {data.weeklyHeatmap.windowStart} - {data.weeklyHeatmap.windowEnd}
              </Pill>
              <Pill className="bg-white/15 text-white">
                训练日 {data.weeklyHeatmap.totalSessions}
              </Pill>
            </div>
          </div>

          <div className="grid gap-6 p-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
            <HumanBodyViewer
              heatmapMeshScores={data.weeklyHeatmap.meshScores}
              viewerLabel="本周肌群覆盖热力图"
            />

            <div className="space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-200">
                  Source Plan
                </p>
                <h3 className="mt-3 text-xl font-bold">
                  {data.weeklyHeatmap.planTitle ?? "暂无训练计划"}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {data.weeklyHeatmap.planId
                    ? "当前热力图基于最近一次保存的训练计划生成，用于快速判断本周刺激是否过度集中或存在遗漏。"
                    : "当前还没有可用于估算覆盖热力的训练计划数据。"}
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-white">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-200">
                    Top Muscles
                  </p>
                  <Pill className="bg-white/10 text-white">
                    峰值 {topScore.toFixed(1)}
                  </Pill>
                </div>

                {data.weeklyHeatmap.muscles.length ? (
                  <div className="mt-4 space-y-3">
                    {data.weeklyHeatmap.muscles.slice(0, 8).map((muscle) => (
                      <div
                        key={muscle.muscleKey}
                        className="rounded-2xl border border-white/10 bg-slate-950/35 p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">{muscle.muscleName}</p>
                            <p className="mt-1 text-xs text-slate-300">
                              {muscle.category} · {muscle.muscleKey}
                            </p>
                          </div>
                          <Pill className="bg-white/10 text-white">
                            {muscle.score.toFixed(1)}
                          </Pill>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,_#fb923c,_#dc2626)]"
                            style={{
                              width: `${
                                topScore > 0 ? (muscle.score / topScore) * 100 : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-white/15 p-4 text-sm text-slate-300">
                    暂无训练计划覆盖数据，先去生成或保存一份训练计划。
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6">
          <section className="rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-panel backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-500">
                  Weight Trend
                </p>
                <h2 className="mt-2 text-2xl font-bold text-ink">体重趋势</h2>
                <p className="mt-2 text-sm text-slate-500">
                  最近 8 条身体数据记录，方便快速观察体重是否按预期变化。
                </p>
              </div>
              {data.bodyMetricTrend.length ? (
                <Pill className="bg-orange-50 text-orange-700">
                  最新 {data.bodyMetricTrend.at(-1)?.weightKg ?? "--"} kg
                </Pill>
              ) : null}
            </div>

            {data.bodyMetricTrend.length ? (
              <div className="mt-6">
                <div className="flex min-h-[220px] items-end gap-3">
                  {data.bodyMetricTrend.map((item) => (
                    <div key={item.id} className="flex flex-1 flex-col items-center gap-3">
                      <div className="text-xs font-semibold text-slate-500">
                        {item.weightKg.toFixed(1)}
                      </div>
                      <div
                        className="w-full rounded-t-[20px] bg-[linear-gradient(180deg,_rgba(249,115,22,0.9),_rgba(251,191,36,0.8))]"
                        style={{ height: `${getBarHeight(item.weightKg, maxWeight)}px` }}
                      />
                      <div className="text-xs text-slate-400">
                        {formatDate(item.recordedAt)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {data.bodyMetricTrend.slice(-2).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[22px] border border-slate-100 bg-slate-50/80 p-4"
                    >
                      <p className="text-xs uppercase tracking-[0.18em] text-orange-500">
                        {formatDate(item.recordedAt)}
                      </p>
                      <p className="mt-2 text-lg font-bold text-ink">
                        {item.weightKg.toFixed(1)} kg
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        体脂 {item.bodyFatPercentage?.toFixed(1) ?? "--"}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-[24px] border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                暂无身体数据，先去历史页面添加体重记录。
              </div>
            )}
          </section>

          <section className="rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-panel backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-500">
                  Nutrition Trend
                </p>
                <h2 className="mt-2 text-2xl font-bold text-ink">营养目标趋势</h2>
                <p className="mt-2 text-sm text-slate-500">
                  展示最近 8 次营养方案中的目标热量与蛋白质，查看饮食策略是否持续一致。
                </p>
              </div>
            </div>

            {data.nutritionTrend.length ? (
              <div className="mt-6 space-y-3">
                {data.nutritionTrend.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[22px] border border-slate-100 bg-slate-50/80 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-orange-500">
                          {formatDate(item.createdAt)}
                        </p>
                        <h3 className="mt-2 text-lg font-bold text-ink">
                          {item.targetCalories} kcal
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          蛋白质 {item.proteinG} g · {formatGoal(item.goal)}
                          {item.dayType
                            ? ` · ${item.dayType === "training" ? "训练日" : "休息日"}`
                            : ""}
                        </p>
                      </div>
                      <Pill className="bg-white text-slate-600">
                        {item.proteinG} g
                      </Pill>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,_#fb923c,_#f97316)]"
                        style={{
                          width: `${
                            maxCalories > 0
                              ? (item.targetCalories / maxCalories) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[24px] border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                暂无营养历史，先去营养规划页面生成一份方案。
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
