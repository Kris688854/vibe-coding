import { NextResponse } from "next/server";
import { listTrainingHistory } from "@/server/services/history-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const items = await listTrainingHistory();
  return NextResponse.json(items);
}

