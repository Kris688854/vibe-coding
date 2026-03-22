import { NextResponse } from "next/server";
import { createTrainingPlan } from "@/server/services/training-plan-service";
import { trainingPlanRequestSchema } from "@/lib/validations/training-plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = trainingPlanRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "训练计划参数不合法",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const plan = await createTrainingPlan(parsed.data);
  return NextResponse.json(plan);
}

