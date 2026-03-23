import { NextResponse } from "next/server";
import { getExerciseCatalog } from "@/server/queries/exercises";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get("category") ?? undefined;
    const catalog = await getExerciseCatalog(category);
    return NextResponse.json(catalog);
  } catch (error) {
    console.error("Failed to load exercise catalog:", error);
    return NextResponse.json(
      { message: "动作列表加载失败，请稍后再试。" },
      { status: 500 },
    );
  }
}
