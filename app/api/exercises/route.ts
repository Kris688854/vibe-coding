import { NextResponse } from "next/server";
import { getExerciseCatalog } from "@/server/queries/exercises";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category") ?? undefined;
  const catalog = await getExerciseCatalog(category);
  return NextResponse.json(catalog);
}

