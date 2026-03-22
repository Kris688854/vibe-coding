import { NextResponse } from "next/server";
import { getTrainingPlanById } from "@/server/services/training-plan-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const plan = await getTrainingPlanById(id);

  if (!plan) {
    return NextResponse.json({ message: "训练计划不存在" }, { status: 404 });
  }

  return NextResponse.json(plan);
}

