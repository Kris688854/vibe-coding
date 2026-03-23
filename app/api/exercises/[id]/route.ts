import { NextResponse } from "next/server";
import { getExerciseDetailById } from "@/server/queries/exercises";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const detail = await getExerciseDetailById(id);

    if (!detail) {
      return NextResponse.json({ message: "动作不存在" }, { status: 404 });
    }

    return NextResponse.json(detail);
  } catch (error) {
    console.error("Failed to load exercise detail:", error);
    return NextResponse.json(
      { message: "动作详情加载失败，请稍后再试。" },
      { status: 500 },
    );
  }
}
