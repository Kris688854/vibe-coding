import { NextResponse } from "next/server";
import { listBodyMetrics } from "@/server/services/history-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const items = await listBodyMetrics();
  return NextResponse.json(items);
}

