"use client";

import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Pill } from "@/components/ui/pill";
import type {
  MealPlanScenario,
  NutritionDayType,
  NutritionPlanRequest,
  NutritionPlanResponse,
} from "@/features/nutrition/types";
import {
  ACTIVITY_LEVEL_OPTIONS,
  DAY_TYPE_OPTIONS,
  DIET_PREFERENCE_OPTIONS,
  GOAL_OPTIONS,
  SEX_OPTIONS,
} from "@/lib/constants/nutrition";
import { cn } from "@/lib/utils/cn";

type NutritionFormValues = Omit<NutritionPlanRequest, "allergies" | "dayType"> & {
  allergiesText: string;
  dayType: NutritionDayType;
};

type FieldProps = {
  label: string;
  children: ReactNode;
};

type ResultTab = "calculation" | "reasoning" | "meals";
type MealPlanTab = "cafeteria" | "convenienceStore" | "fitnessStandard";

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100";

const mealPlanTabMeta: Record<MealPlanTab, { label: string; short: string }> = {
  cafeteria: { label: "食堂版", short: "食堂" },
  convenienceStore: { label: "便利店版", short: "便利店" },
  fitnessStandard: { label: "健身党标准版", short: "标准版" },
};

function Field({ label, children }: FieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function MealSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-[22px] border border-slate-100 bg-slate-50/80 p-4">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <Pill key={`${title}-${item}`} className="bg-white text-slate-700">
            {item}
          </Pill>
        ))}
      </div>
    </div>
  );
}

function dayTypeLabel(dayType: NutritionDayType) {
  return dayType === "training" ? "训练日" : "休息日";
}

function sourceLabel(source: NutritionPlanResponse["source"]) {
  return source === "rules+ai" ? "规则计算 + AI 菜单" : "规则回退";
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

export function NutritionPlanner() {
  const [result, setResult] = useState<NutritionPlanResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState<ResultTab>("calculation");
  const [activeMealPlan, setActiveMealPlan] = useState<MealPlanTab>("cafeteria");
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, watch } = useForm<NutritionFormValues>({
    defaultValues: {
      age: 28,
      sex: "male",
      heightCm: 178,
      weightKg: 75,
      activityLevel: "moderate",
      goal: "muscle_gain",
      dietPreference: "balanced",
      mealsPerDay: 4,
      dayType: "training",
      allergiesText: "",
      notes: "",
    },
  });

  const selectedDayType = watch("dayType");

  const onSubmit = handleSubmit((values) => {
    setErrorMessage("");

    const payload: NutritionPlanRequest = {
      age: values.age,
      sex: values.sex,
      heightCm: values.heightCm,
      weightKg: values.weightKg,
      activityLevel: values.activityLevel,
      goal: values.goal,
      dietPreference: values.dietPreference,
      mealsPerDay: values.mealsPerDay,
      dayType: values.dayType,
      notes: values.notes,
      allergies: values.allergiesText
        .split(/[，,]/)
        .map((item) => item.trim())
        .filter(Boolean),
    };

    startTransition(async () => {
      try {
        const response = await fetch("/api/nutrition-plan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          setErrorMessage(
            await readErrorMessage(
              response,
              "营养规划生成失败，请稍后再试。",
            ),
          );
          return;
        }

        const data = (await response.json()) as NutritionPlanResponse;
        setResult(data);
        setActiveTab("calculation");
        setActiveMealPlan("cafeteria");
      } catch {
        setErrorMessage("营养规划生成失败，请检查网络或稍后重试。");
      }
    });
  });

  const activeMealScenario: MealPlanScenario | null = result
    ? result.mealPlans[activeMealPlan]
    : null;

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <form
        onSubmit={onSubmit}
        className="rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-panel backdrop-blur"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">
          Nutrition Studio
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink">营养计划生成器</h1>
        <p className="mt-2 text-sm text-slate-500">
          规则层负责核心数字，AI 层负责中文解释和贴近日常的可执行菜单。
        </p>

        <div className="mt-5">
          <p className="text-sm font-semibold text-slate-700">日期类型</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DAY_TYPE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition",
                  selectedDayType === option.value
                    ? "border-orange-400 bg-orange-500 text-white"
                    : "border-slate-200 bg-white text-slate-600",
                )}
              >
                <input
                  type="radio"
                  value={option.value}
                  className="sr-only"
                  {...register("dayType")}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="年龄">
            <input
              type="number"
              className={inputClassName}
              {...register("age", { valueAsNumber: true })}
            />
          </Field>
          <Field label="性别">
            <select className={inputClassName} {...register("sex")}>
              {SEX_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="身高 (cm)">
            <input
              type="number"
              className={inputClassName}
              {...register("heightCm", { valueAsNumber: true })}
            />
          </Field>
          <Field label="体重 (kg)">
            <input
              type="number"
              className={inputClassName}
              {...register("weightKg", { valueAsNumber: true })}
            />
          </Field>
          <Field label="活动水平">
            <select className={inputClassName} {...register("activityLevel")}>
              {ACTIVITY_LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="目标">
            <select className={inputClassName} {...register("goal")}>
              {GOAL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="饮食偏好">
            <select className={inputClassName} {...register("dietPreference")}>
              {DIET_PREFERENCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="每日餐次">
            <input
              type="number"
              className={inputClassName}
              {...register("mealsPerDay", { valueAsNumber: true })}
            />
          </Field>
        </div>

        <div className="mt-4 space-y-4">
          <Field label="食材禁忌">
            <input
              className={inputClassName}
              placeholder="例如：牛奶、花生、海鲜"
              {...register("allergiesText")}
            />
          </Field>
          <Field label="额外说明">
            <textarea
              className={`${inputClassName} min-h-[110px] resize-none`}
              placeholder="例如：晚上训练，希望训练后安排主餐；或者工作日主要靠便利店解决。"
              {...register("notes")}
            />
          </Field>
        </div>

        {errorMessage ? (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          className="mt-6 inline-flex rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          {isPending ? "正在生成计划..." : "生成营养计划"}
        </button>
      </form>

      <div className="space-y-6">
        <div className="rounded-[28px] border border-white/25 bg-hero-grid p-6 text-white shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-200">
                Three-Layer Output
              </p>
              <h2 className="mt-2 text-3xl font-bold">计算结果、解释逻辑、饮食示例</h2>
              <p className="mt-3 max-w-2xl text-sm text-slate-200">
                结果会按三层结构展示，并支持训练日 / 休息日的场景差异。
              </p>
            </div>
            {result ? (
              <div className="flex flex-wrap gap-2">
                <Pill className="bg-white/15 text-white">
                  {dayTypeLabel(result.dayType)}
                </Pill>
                <Pill className="bg-white/15 text-white">
                  来源：{sourceLabel(result.source)}
                </Pill>
              </div>
            ) : null}
          </div>
        </div>

        {result ? (
          <div className="rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-panel backdrop-blur">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "calculation", label: "计算结果" },
                { id: "reasoning", label: "解释逻辑" },
                { id: "meals", label: "饮食示例" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as ResultTab)}
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

            {activeTab === "calculation" ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-panel">
                  <p className="text-sm text-slate-500">维持热量</p>
                  <p className="mt-2 text-3xl font-bold text-ink">
                    {result.calculation.maintenanceCalories}
                  </p>
                  <p className="text-xs text-slate-500">kcal / day</p>
                </div>
                <div className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-panel">
                  <p className="text-sm text-slate-500">目标热量</p>
                  <p className="mt-2 text-3xl font-bold text-ink">
                    {result.calculation.targetCalories}
                  </p>
                  <p className="text-xs text-slate-500">kcal / day</p>
                </div>
                <div className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-panel">
                  <p className="text-sm text-slate-500">蛋白质</p>
                  <p className="mt-2 text-3xl font-bold text-ink">
                    {result.calculation.proteinG}
                  </p>
                  <p className="text-xs text-slate-500">g / day</p>
                </div>
                <div className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-panel">
                  <p className="text-sm text-slate-500">碳水</p>
                  <p className="mt-2 text-3xl font-bold text-ink">
                    {result.calculation.carbsG}
                  </p>
                  <p className="text-xs text-slate-500">g / day</p>
                </div>
                <div className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-panel">
                  <p className="text-sm text-slate-500">脂肪</p>
                  <p className="mt-2 text-3xl font-bold text-ink">
                    {result.calculation.fatG}
                  </p>
                  <p className="text-xs text-slate-500">g / day</p>
                </div>
                <div className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-panel">
                  <p className="text-sm text-slate-500">饮水</p>
                  <p className="mt-2 text-3xl font-bold text-ink">
                    {result.calculation.waterMl}
                  </p>
                  <p className="text-xs text-slate-500">ml / day</p>
                </div>
              </div>
            ) : null}

            {activeTab === "reasoning" ? (
              <div className="mt-6 space-y-3">
                {result.reasoning.map((item, index) => (
                  <div
                    key={item}
                    className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                      逻辑 {index + 1}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {activeTab === "meals" ? (
              <div className="mt-6">
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(mealPlanTabMeta) as MealPlanTab[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveMealPlan(key)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-semibold transition",
                        activeMealPlan === key
                          ? "border-orange-400 bg-orange-500 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-600",
                      )}
                    >
                      {mealPlanTabMeta[key].label}
                    </button>
                  ))}
                </div>

                {activeMealScenario ? (
                  <div className="mt-5 space-y-4">
                    <div className="rounded-[24px] border border-orange-100 bg-orange-50/70 p-5">
                      <p className="text-sm font-semibold text-orange-700">
                        {mealPlanTabMeta[activeMealPlan].short}总览
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-700">
                        {activeMealScenario.summary}
                      </p>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                      <MealSection title="早餐" items={activeMealScenario.breakfast} />
                      <MealSection title="午餐" items={activeMealScenario.lunch} />
                      <MealSection title="晚餐" items={activeMealScenario.dinner} />
                      <MealSection title="加餐" items={activeMealScenario.snacks} />
                    </div>

                    <MealSection
                      title="替换建议"
                      items={activeMealScenario.substitutions}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/70 p-10 text-center text-sm text-slate-500">
            提交表单后，这里会按“三层结构”展示计算结果、解释逻辑和三种日常场景的饮食示例。
          </div>
        )}
      </div>
    </section>
  );
}
