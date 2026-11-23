import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLeaderboard } from "@/lib/rankings";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const benchmark = sp.get("benchmark");
    const category = sp.get("category");
    const limit = Math.min(50, Math.max(1, parseInt(sp.get("limit") ?? "20", 10) || 20));

    if (benchmark) {
      const exists = await prisma.benchmark.findUnique({ where: { slug: benchmark } });
      if (!exists) {
        return NextResponse.json({ error: `Unknown benchmark: ${benchmark}` }, { status: 404 });
      }
    }

    const data = await getLeaderboard({ benchmark, category, limit });
    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/rankings failed", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}