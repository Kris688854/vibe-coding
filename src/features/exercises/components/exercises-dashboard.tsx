"use client";

import { useEffect, useState, useTransition } from "react";
import { HumanBodyViewer } from "@/components/3d/human-body-viewer";
import { Pill } from "@/components/ui/pill";
import type {
  ExerciseCatalogResponse,
  ExerciseDetail,
} from "@/features/exercises/types";
import {
  CATEGORY_META,
  DIFFICULTY_META,
} from "@/lib/constants/exercise-taxonomy";
import { cn } from "@/lib/utils/cn";

type ExercisesDashboardProps = {
  initialCatalog: ExerciseCatalogResponse;
  initialDetail: ExerciseDetail | null;
};

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

export function ExercisesDashboard({
  initialCatalog,
  initialDetail,
}: ExercisesDashboardProps) {
  const [catalog, setCatalog] = useState(initialCatalog);
  const [selectedId, setSelectedId] = useState(
    initialDetail?.id ?? initialCatalog.defaultSelectedId,
  );
  const [detail, setDetail] = useState<ExerciseDetail | null>(initialDetail);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCatalogPending, startCatalogTransition] = useTransition();
  const [isDetailPending, startDetailTransition] = useTransition();

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    setErrorMessage("");

    startDetailTransition(async () => {
      try {
        const response = await fetch(`/api/exercises/${selectedId}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          if (!cancelled) {
            setErrorMessage(
              await readErrorMessage(
                response,
                "动作详情加载失败，请稍后再试。",
              ),
            );
          }
          return;
        }

        const payload = (await response.json()) as ExerciseDetail;
        if (!cancelled) {
          setDetail(payload);
        }
      } catch {
        if (!cancelled) {
          setErrorMessage("动作详情加载失败，请检查网络或稍后重试。");
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  async function handleCategoryChange(categoryId: string) {
    if (categoryId === catalog.selectedCategory) {
      return;
    }

    setErrorMessage("");
    startCatalogTransition(async () => {
      try {
        const response = await fetch(`/api/exercises?category=${categoryId}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          setErrorMessage(
            await readErrorMessage(
              response,
              "分类切换失败，请稍后再试。",
            ),
          );
          return;
        }

        const payload = (await response.json()) as ExerciseCatalogResponse;
        setCatalog(payload);
        setSelectedId(payload.defaultSelectedId);
        if (!payload.defaultSelectedId) {
          setDetail(null);
        }
      } catch {
        setErrorMessage("分类切换失败，请检查网络或稍后重试。");
      }
    });
  }

  const currentDifficulty = detail
    ? DIFFICULTY_META[detail.difficulty as keyof typeof DIFFICULTY_META]
    : null;

  return (
    <div className="space-y-4">
      {errorMessage ? (
        <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)_340px]">
        <aside className="rounded-[28px] border border-white/60 bg-white/80 p-5 shadow-panel backdrop-blur">
          <div className="mb-5 space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">
              Exercise Atlas
            </p>
            <h1 className="text-2xl font-bold text-ink">动作库与肌群联动</h1>
            <p className="text-sm text-slate-500">
              选择训练部位与动作，右侧详情和中间 3D 模型会同步刷新。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {catalog.categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => void handleCategoryChange(category.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition",
                  category.id === catalog.selectedCategory
                    ? "border-orange-400 bg-orange-500 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-orange-200 hover:bg-orange-50",
                )}
              >
                {category.icon} {category.label} · {category.count}
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-[24px] border border-slate-100 bg-slate-50/80 p-3">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">
                {CATEGORY_META[catalog.selectedCategory as keyof typeof CATEGORY_META]
                  ?.label ?? "动作"}
              </span>
              {isCatalogPending ? (
                <span className="text-xs text-orange-500">正在切换</span>
              ) : null}
            </div>
            <div className="max-h-[540px] space-y-2 overflow-y-auto pr-1">
              {catalog.exercises.length ? (
                catalog.exercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => setSelectedId(exercise.id)}
                    className={cn(
                      "w-full rounded-2xl border px-4 py-4 text-left transition",
                      selectedId === exercise.id
                        ? "border-orange-300 bg-white shadow-sm"
                        : "border-transparent bg-white/70 hover:border-orange-200 hover:bg-white",
                    )}
                  >
                    <p className="font-semibold text-ink">{exercise.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{exercise.nameEn}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Pill className="bg-slate-100 text-slate-600">
                        {
                          DIFFICULTY_META[
                            exercise.difficulty as keyof typeof DIFFICULTY_META
                          ]?.label
                        }
                      </Pill>
                      {exercise.equipment.slice(0, 2).map((item) => (
                        <Pill key={item} className="bg-orange-50 text-orange-700">
                          {item}
                        </Pill>
                      ))}
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                  当前分类下还没有可用动作。
                </div>
              )}
            </div>
          </div>
        </aside>

        <div className="overflow-hidden rounded-[28px] border border-white/25 bg-[linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(2,6,23,1))] shadow-panel">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_34%)] p-6 text-white">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.24em] text-orange-200">
                Live Highlight
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                {detail?.name ?? "选择一个动作开始查看"}
              </h2>
              <p className="mt-2 text-sm text-slate-200">
                {detail?.description ??
                  "当前会根据动作主肌群与次肌群实时高亮人体模型。"}
              </p>
            </div>
            {currentDifficulty ? (
              <Pill className="bg-white/15 text-white">
                {currentDifficulty.label}
              </Pill>
            ) : null}
          </div>
          <div className="p-5">
            <HumanBodyViewer
              primaryMeshKeys={detail?.primaryMeshKeys ?? []}
              secondaryMeshKeys={detail?.secondaryMeshKeys ?? []}
              viewerLabel={detail?.name ?? "人体肌群模型"}
            />
          </div>
        </div>

        <aside className="rounded-[28px] border border-white/60 bg-white/85 p-5 shadow-panel backdrop-blur">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">
                Detail
              </p>
              <h2 className="mt-2 text-2xl font-bold text-ink">
                {detail?.name ?? "暂无动作"}
              </h2>
            </div>
            {isDetailPending ? (
              <span className="text-xs text-orange-500">正在刷新</span>
            ) : null}
          </div>
          {detail ? (
            <div className="mt-5 space-y-6">
              <div className="rounded-[24px] bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">动作说明</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {detail.description}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">主肌群</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {detail.primaryMuscles.length ? (
                    detail.primaryMuscles.map((muscle) => (
                      <Pill
                        key={muscle.id}
                        className="text-white"
                        style={{ backgroundColor: muscle.color }}
                      >
                        {muscle.name}
                      </Pill>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">暂未标注</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">次肌群</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {detail.secondaryMuscles.length ? (
                    detail.secondaryMuscles.map((muscle) => (
                      <Pill
                        key={muscle.id}
                        className="border border-orange-200 bg-orange-50 text-orange-700"
                      >
                        {muscle.name}
                      </Pill>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">该动作未配置次肌群。</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">动作提示</p>
                <ol className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
                  {detail.instructions.map((instruction) => (
                    <li
                      key={instruction}
                      className="rounded-2xl border border-slate-100 bg-white p-3"
                    >
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">器械</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {detail.equipment.map((item) => (
                    <Pill key={item} className="bg-slate-100 text-slate-700">
                      {item}
                    </Pill>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-[24px] border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              暂无动作详情，请先从左侧列表选择一个动作。
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
