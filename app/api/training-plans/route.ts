import { NextResponse } from "next/server";
import { listTrainingPlans } from "@/server/services/training-plan-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const plans = await listTrainingPlans();
  return NextResponse.json(plans);
}

