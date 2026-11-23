import { NextRequest, NextResponse } from "next/server";
import { getModelBySlug } from "@/lib/models";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const model = await getModelBySlug(slug);

    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }
    return NextResponse.json({ data: model });
  } catch (err) {
    console.error("GET /api/models/[slug] failed", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}