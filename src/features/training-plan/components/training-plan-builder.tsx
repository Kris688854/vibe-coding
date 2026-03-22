"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Pill } from "@/components/ui/pill";
import type { ExerciseDetail } from "@/features/exercises/types";
import type {
  ExperienceLevel,
  SplitType,
  TrainingGoal,
  TrainingPlanListItem,
  TrainingPlanRequest,
  TrainingPlanResponse,
  TrainingRestriction,
} from "@/features/training-plan/types";
import {
  EQUIPMENT_ACCESS_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  RESTRICTION_OPTIONS,
  SESSION_DURATION_OPTIONS,
  SPLIT_TYPE_OPTIONS,
  TRAINING_DAY_OPTIONS,
  TRAINING_GOAL_OPTIONS,
} from "@/lib/constants/training-plan";
import { cn } from "@/lib/utils/cn";

type BuilderProps = {
  initialPlans: TrainingPlanListItem[];
};

type BuilderForm = TrainingPlanRequest;

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export function TrainingPlanBuilder({ initialPlans }: BuilderProps) {
  const [plans, setPlans] = useState(initialPlans);
  const [activePlan, setActivePlan] = useState<TrainingPlanResponse | null>(null);
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null);
  const [selectedExerciseDetail, setSelectedExerciseDetail] =
    useState<ExerciseDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, watch } = useForm<BuilderForm>({
    defaultValues: {
      goal: "bulk",
      trainingDaysPerWeek: 4,
      experienceLevel: "intermediate",
      splitType: "upper-lower",
      equipmentAccess: "gym",
      sessionDurationMinutes: 60,
      restrictions: [],
    },
  });

  const selectedRestrictions = watch("restrictions") ?? [];

  const sortedPlans = useMemo(
    () =>
      [...plans].sort((left, right) =>
        right.createdAt.localeCompare(left.createdAt, "zh-CN"),
      ),
    [plans],
  );

  const onSubmit = handleSubmit((values) => {
    setErrorMessage("");
    startTransition(async () => {
      const response = await fetch("/api/training-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        setErrorMessage(error.message ?? "训练计划生成失败");
        return;
      }

      const nextPlan = (await response.json()) as TrainingPlanResponse;
      setActivePlan(nextPlan);
      setExpandedDayId(nextPlan.days[0]?.id ?? null);

      const latestPlans = await fetch("/api/training-plans", {
        cache: "no-store",
      });
      const list = (await latestPlans.json()) as TrainingPlanListItem[];
      setPlans(list);
    });
  });

  async function openPlan(planId: string) {
    startTransition(async () => {
      const response = await fetch(`/api/training-plans/${planId}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        return;
      }

      const plan = (await response.json()) as TrainingPlanResponse;
      setActivePlan(plan);
      setExpandedDayId(plan.days[0]?.id ?? null);
    });
  }

  async function openExercise(exerciseId: string) {
    const response = await fetch(`/api/exercises/${exerciseId}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return;
    }

    const detail = (await response.json()) as ExerciseDetail;
    setSelectedExerciseDetail(detail);
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
      <div className="space-y-6">
        <form
          onSubmit={onSubmit}
          className="rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-panel backdrop-blur"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">
            Training Studio
          </p>
          <h1 className="mt-2 text-3xl font-bold text-ink">一周训练计划生成器</h1>
          <p className="mt-2 text-sm text-slate-500">
            规则层先排结构和动作，再由 AI 补充解释逻辑，最终结果会保存到数据库。
          </p>

          <div className="mt-6 grid gap-4">
            <Field label="目标">
              <select className={inputClassName} {...register("goal")}>
                {TRAINING_GOAL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="每周训练天数">
              <select
                className={inputClassName}
                {...register("trainingDaysPerWeek", { valueAsNumber: true })}
              >
                {TRAINING_DAY_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    每周 {value} 天
                  </option>
                ))}
              </select>
            </Field>
            <Field label="训练水平">
              <select className={inputClassName} {...register("experienceLevel")}>
                {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="分化方式">
              <select className={inputClassName} {...register("splitType")}>
                {SPLIT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="器械条件">
              <select className={inputClassName} {...register("equipmentAccess")}>
                {EQUIPMENT_ACCESS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="单次训练时长">
              <select
                className={inputClassName}
                {...register("sessionDurationMinutes", { valueAsNumber: true })}
              >
                {SESSION_DURATION_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value} 分钟
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-slate-700">限制条件</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {RESTRICTION_OPTIONS.map((option) => {
                const checked = selectedRestrictions.includes(
                  option.value as TrainingRestriction,
                );
                return (
                  <label
                    key={option.value}
                    className={cn(
                      "cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition",
                      checked
                        ? "border-orange-400 bg-orange-500 text-white"
                        : "border-slate-200 bg-white text-slate-600",
                    )}
                  >
                    <input
                      type="checkbox"
                      value={option.value}
                      className="sr-only"
                      {...register("restrictions")}
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </div>

          {errorMessage ? (
            <p className="mt-4 text-sm text-red-500">{errorMessage}</p>
          ) : null}

          <button
            type="submit"
            className="mt-6 inline-flex rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            {isPending ? "正在生成计划..." : "生成训练计划"}
          </button>
        </form>

        <div className="rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-panel backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">
            Saved Plans
          </p>
          <div className="mt-4 space-y-3">
            {sortedPlans.length ? (
              sortedPlans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => void openPlan(plan.id)}
                  className="w-full rounded-[22px] border border-slate-100 bg-slate-50/80 p-4 text-left transition hover:border-orange-200 hover:bg-white"
                >
                  <p className="font-semibold text-ink">{plan.title}</p>
                  <p className="mt-2 text-sm text-slate-500">{plan.summary}</p>
                  <p className="mt-3 text-xs text-slate-400">
                    {plan.weeklySchedule.join(" / ")}
                  </p>
                </button>
              ))
            ) : (
              <div className="rounded-[22px] border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                还没有已保存的训练计划，先生成一份看看。
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-[28px] border border-white/25 bg-hero-grid p-6 text-white shadow-panel">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-200">
            Weekly Program
          </p>
          <h2 className="mt-2 text-3xl font-bold">
            {activePlan?.title ?? "生成后在这里查看整周训练安排"}
          </h2>
          <p className="mt-3 max-w-3xl text-sm text-slate-200">
            {activePlan?.summary ??
              "右侧会展示训练计划标题、摘要、周安排、每日动作，以及这样安排的原因。"}
          </p>
        </div>

        {activePlan ? (
          <>
            <div className="rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-panel backdrop-blur">
              <div className="flex flex-wrap gap-2">
                {activePlan.weeklySchedule.map((item) => (
                  <Pill key={item} className="bg-orange-50 text-orange-700">
                    {item}
                  </Pill>
                ))}
              </div>
              <div className="mt-5 space-y-4">
                {activePlan.days.map((day) => {
                  const expanded = expandedDayId === day.id;
                  return (
                    <div
                      key={day.id}
                      className="overflow-hidden rounded-[24px] border border-slate-100 bg-slate-50/80"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedDayId(expanded ? null : day.id)}
                        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
                      >
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                            Day {day.dayIndex}
                          </p>
                          <h3 className="mt-2 text-xl font-bold text-ink">
                            {day.label} · {day.focus}
                          </h3>
                          <p className="mt-2 text-sm text-slate-500">{day.summary}</p>
                        </div>
                        <Pill className="bg-white text-slate-600">
                          {expanded ? "收起" : "展开"}
                        </Pill>
                      </button>

                      {expanded ? (
                        <div className="border-t border-slate-100 bg-white/70 px-5 py-4">
                          <div className="space-y-3">
                            {day.exercises.map((exercise) => (
                              <div
                                key={exercise.id}
                                className="rounded-[20px] border border-slate-100 bg-white p-4"
                              >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div>
                                    <button
                                      type="button"
                                      onClick={() => void openExercise(exercise.exerciseId)}
                                      className="text-left text-lg font-semibold text-ink underline-offset-4 hover:underline"
                                    >
                                      {exercise.name}
                                    </button>
                                    <p className="mt-1 text-sm text-slate-500">
                                      {exercise.sets} 组 · {exercise.reps} 次 · 休息 {exercise.restSeconds} 秒
                                    </p>
                                  </div>
                                  <Pill className="bg-orange-50 text-orange-700">
                                    {exercise.category}
                                  </Pill>
                                </div>
                                <p className="mt-3 text-sm text-slate-600">
                                  {exercise.notes}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-panel backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">
                Why This Split
              </p>
              <div className="mt-4 space-y-3">
                {activePlan.explanation.map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] border border-slate-100 bg-slate-50/80 p-4 text-sm leading-7 text-slate-600"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {selectedExerciseDetail ? (
              <div className="rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-panel backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">
                      Exercise Detail
                    </p>
                    <h3 className="mt-2 text-2xl font-bold text-ink">
                      {selectedExerciseDetail.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedExerciseDetail(null)}
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600"
                  >
                    关闭
                  </button>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {selectedExerciseDetail.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedExerciseDetail.primaryMuscles.map((muscle) => (
                    <Pill
                      key={muscle.id}
                      className="text-white"
                      style={{ backgroundColor: muscle.color }}
                    >
                      {muscle.name}
                    </Pill>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedExerciseDetail.equipment.map((item) => (
                    <Pill key={item} className="bg-slate-100 text-slate-700">
                      {item}
                    </Pill>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/70 p-10 text-center text-sm text-slate-500">
            生成训练计划后，这里会展示每周安排、每天动作细节和排课解释。
          </div>
        )}
      </div>
    </section>
  );
}

