import { NextResponse } from "next/server";
import { getExerciseDetailById } from "@/server/queries/exercises";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const detail = await getExerciseDetailById(id);

  if (!detail) {
    return NextResponse.json({ message: "动作不存在" }, { status: 404 });
  }

  return NextResponse.json(detail);
}

