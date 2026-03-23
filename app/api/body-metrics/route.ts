import { NextResponse } from "next/server";
import { bodyMetricCreateSchema } from "@/lib/validations/body-metrics";
import { createBodyMetric } from "@/server/services/history-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bodyMetricCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "身体数据参数不合法",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const record = await createBodyMetric(parsed.data);
    return NextResponse.json(record);
  } catch (error) {
    console.error("Failed to create body metric:", error);
    return NextResponse.json(
      { message: "身体数据保存失败，请稍后再试。" },
      { status: 500 },
    );
  }
}
