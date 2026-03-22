import { NextResponse } from "next/server";
import { listNutritionHistory } from "@/server/services/history-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const items = await listNutritionHistory();
  return NextResponse.json(items);
}

