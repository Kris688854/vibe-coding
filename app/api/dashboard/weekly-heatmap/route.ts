import { NextResponse } from "next/server";
import { getWeeklyHeatmap } from "@/server/services/dashboard-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await getWeeklyHeatmap();
  return NextResponse.json(payload);
}
