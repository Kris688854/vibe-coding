"use client";

import { useState, useTransition } from "react";
import { Pill } from "@/components/ui/pill";
import type {
  BodyMetricCreateInput,
  BodyMetricRecord,
  NutritionHistoryItem,
  TrainingHistoryItem,
} from "@/features/history/types";
import { cn } from "@/lib/utils/cn";

type HistoryTab = "nutrition" | "training" | "body";

type HistoryDashboardProps = {
  initialNutrition: NutritionHistoryItem[];
  initialTraining: TrainingHistoryItem[];
  initialBodyMetrics: BodyMetricRecord[];
};

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100";

function formatGoal(value: string) {
  const map: Record<string, string> = {
    fat_loss: "减脂",
    maintenance: "维持",
    muscle_gain: "增肌",
    bulk: "增肌期",
    cut: "减脂期",
    maintain: "维持状态",
    recomp: "体态重组",
  };
  return map[value] ?? value;
}

function formatDate(value: string) {
  return value.slice(0, 10);
}

async function readErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: string };
    return payload.message ?? fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export function HistoryDashboard({
  initialNutrition,
  initialTraining,
  initialBodyMetrics,
}: HistoryDashboardProps) {
  const [activeTab, setActiveTab] = useState<HistoryTab>("nutrition");
  const [nutritionItems] = useState(initialNutrition);
  const [trainingItems] = useState(initialTraining);
  const [bodyMetricItems, setBodyMetricItems] = useState(initialBodyMetrics);
  const [expandedNutritionId, setExpandedNutritionId] = useState<string | null>(null);
  const [expandedTrainingId, setExpandedTrainingId] = useState<string | null>(null);
  const [form, setForm] = useState<BodyMetricCreateInput>({
    weightKg: 70,
    bodyFatPercentage: null,
    recordedAt: new Date().toISOString().slice(0, 10),
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleCreateBodyMetric() {
    setErrorMessage("");
    startTransition(async () => {
      try {
        const response = await fetch("/api/body-metrics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });

        if (!response.ok) {
          setErrorMessage(
            await readErrorMessage(
              response,
              "新增身体数据失败，请稍后再试。",
            ),
          );
          return;
        }

        const latest = await fetch("/api/history/body-metrics", {
          cache: "no-store",
        });

        if (!latest.ok) {
          setErrorMessage("记录已保存，但历史列表刷新失败，请手动刷新页面。");
          return;
        }

        const items = (await latest.json()) as BodyMetricRecord[];
        setBodyMetricItems(items);
      } catch {
        setErrorMessage("新增身体数据失败，请检查网络或稍后重试。");
      }
    });
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/25 bg-hero-grid p-6 text-white shadow-panel">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-200">
          History Center
        </p>
        <h1 className="mt-2 text-3xl font-bold">历史方案与身体数据</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-200">
          统一查看营养方案、训练计划和身体数据记录，便于横向对比和后续复盘。
        </p>
      </div>

      <div className="rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-panel backdrop-blur">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "nutrition", label: "营养历史" },
            { id: "training", label: "训练历史" },
            { id: "body", label: "身体数据" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as HistoryTab)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition",
                activeTab === tab.id
                  ? "border-orange-400 bg-orange-500 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-600",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "nutrition" ? (
          <div className="mt-6 space-y-4">
            {nutritionItems.length ? (
              nutritionItems.map((item) => {
                const expanded = expandedNutritionId === item.id;
                return (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-[24px] border border-slate-100 bg-slate-50/80"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                          {formatDate(item.createdAt)}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Pill className="bg-orange-50 text-orange-700">
                            {formatGoal(item.goal)}
                          </Pill>
                          <Pill className="bg-white text-slate-600">
                            热量 {item.targetCalories}
                          </Pill>
                          <Pill className="bg-white text-slate-600">
                            蛋白 {item.proteinG}g
                          </Pill>
                          <Pill className="bg-white text-slate-600">
                            碳水 {item.carbsG}g
                          </Pill>
                          <Pill className="bg-white text-slate-600">
                            脂肪 {item.fatG}g
                          </Pill>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedNutritionId(expanded ? null : item.id)
                        }
                        className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600"
                      >
                        {expanded ? "收起详情" : "查看详情"}
                      </button>
                    </div>
                    {expanded ? (
                      <div className="border-t border-slate-100 bg-white/80 px-5 py-4">
                        <div className="grid gap-4 xl:grid-cols-2">
                          <div className="rounded-[22px] border border-slate-100 bg-slate-50/80 p-4">
                            <p className="text-sm font-semibold text-slate-700">解释逻辑</p>
                            <div className="mt-3 space-y-3">
                              {item.details.reasoning.map((point) => (
                                <div
                                  key={point}
                                  className="rounded-2xl bg-white p-3 text-sm leading-6 text-slate-600"
                                >
                                  {point}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="rounded-[22px] border border-slate-100 bg-slate-50/80 p-4">
                            <p className="text-sm font-semibold text-slate-700">
                              饮食示例摘要
                            </p>
                            <div className="mt-3 space-y-3">
                              {Object.entries(item.details.mealPlans).map(
                                ([key, plan]) => (
                                  <div
                                    key={key}
                                    className="rounded-2xl bg-white p-3 text-sm text-slate-600"
                                  >
                                    <p className="font-semibold text-ink">{key}</p>
                                    <p className="mt-2 leading-6">{plan.summary}</p>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                还没有营养方案历史记录。
              </div>
            )}
          </div>
        ) : null}

        {activeTab === "training" ? (
          <div className="mt-6 space-y-4">
            {trainingItems.length ? (
              trainingItems.map((item) => {
                const expanded = expandedTrainingId === item.id;
                return (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-[24px] border border-slate-100 bg-slate-50/80"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                          {formatDate(item.createdAt)}
                        </p>
                        <h3 className="text-xl font-bold text-ink">{item.title}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Pill className="bg-orange-50 text-orange-700">
                            {formatGoal(item.goal)}
                          </Pill>
                          <Pill className="bg-white text-slate-600">
                            {item.trainingDays} 天 / 周
                          </Pill>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedTrainingId(expanded ? null : item.id)
                        }
                        className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600"
                      >
                        {expanded ? "收起详情" : "查看详情"}
                      </button>
                    </div>
                    {expanded ? (
                      <div className="border-t border-slate-100 bg-white/80 px-5 py-4">
                        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                          <div className="rounded-[22px] border border-slate-100 bg-slate-50/80 p-4">
                            <p className="text-sm font-semibold text-slate-700">每周安排</p>
                            <div className="mt-3 space-y-3">
                              {item.details.days.map((day) => (
                                <div
                                  key={day.id}
                                  className="rounded-2xl bg-white p-3 text-sm text-slate-600"
                                >
                                  <p className="font-semibold text-ink">
                                    {day.label} · {day.focus}
                                  </p>
                                  <p className="mt-2 leading-6">{day.summary}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="rounded-[22px] border border-slate-100 bg-slate-50/80 p-4">
                            <p className="text-sm font-semibold text-slate-700">计划解释</p>
                            <div className="mt-3 space-y-3">
                              {item.details.explanation.map((point) => (
                                <div
                                  key={point}
                                  className="rounded-2xl bg-white p-3 text-sm leading-6 text-slate-600"
                                >
                                  {point}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                还没有训练计划历史记录。
              </div>
            )}
          </div>
        ) : null}

        {activeTab === "body" ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
            <div className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
                New Record
              </p>
              <div className="mt-4 space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">体重 (kg)</span>
                  <input
                    type="number"
                    className={inputClassName}
                    value={form.weightKg}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        weightKg: Number(event.target.value),
                      }))
                    }
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">体脂 (%)</span>
                  <input
                    type="number"
                    className={inputClassName}
                    value={form.bodyFatPercentage ?? ""}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        bodyFatPercentage: event.target.value
                          ? Number(event.target.value)
                          : null,
                      }))
                    }
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">记录日期</span>
                  <input
                    type="date"
                    className={inputClassName}
                    value={form.recordedAt}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        recordedAt: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
              {errorMessage ? (
                <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
                  {errorMessage}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => void handleCreateBodyMetric()}
                className="mt-5 inline-flex rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                {isPending ? "正在保存..." : "新增记录"}
              </button>
            </div>

            <div className="space-y-4">
              {bodyMetricItems.length ? (
                bodyMetricItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                          {formatDate(item.recordedAt)}
                        </p>
                        <h3 className="mt-2 text-2xl font-bold text-ink">
                          {item.weightKg} kg
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Pill className="bg-white text-slate-600">
                          体脂 {item.bodyFatPercentage ?? "--"}%
                        </Pill>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                  还没有身体数据记录。
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
