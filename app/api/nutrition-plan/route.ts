import { NextResponse } from "next/server";
import { createNutritionPlan } from "@/server/services/nutrition-planner";
import { nutritionPlanRequestSchema } from "@/lib/validations/nutrition";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = nutritionPlanRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "营养规划参数不合法",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const plan = await createNutritionPlan(parsed.data);
    return NextResponse.json(plan);
  } catch (error) {
    console.error("Failed to create nutrition plan:", error);
    return NextResponse.json(
      { message: "营养规划生成失败，请稍后再试。" },
      { status: 500 },
    );
  }
}
