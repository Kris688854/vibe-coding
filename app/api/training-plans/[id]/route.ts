import { NextResponse } from "next/server";
import { getTrainingPlanById } from "@/server/services/training-plan-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const plan = await getTrainingPlanById(id);

    if (!plan) {
      return NextResponse.json({ message: "训练计划不存在" }, { status: 404 });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Failed to load training plan:", error);
    return NextResponse.json(
      { message: "训练计划加载失败，请稍后再试。" },
      { status: 500 },
    );
  }
}
