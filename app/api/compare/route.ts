import { NextRequest, NextResponse } from "next/server";
import { getModelsBySlugs } from "@/lib/models";

export async function GET(req: NextRequest) {
  try {
    const raw = req.nextUrl.searchParams.get("models") ?? "";
    const slugs = [...new Set(raw.split(",").map((s) => s.trim()).filter(Boolean))];

    if (slugs.length < 2 || slugs.length > 4) {
      return NextResponse.json({ error: "Provide 2 to 4 model slugs in ?models=a,b" }, { status: 400 });
    }

    const data = await getModelsBySlugs(slugs);
    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/compare failed", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}