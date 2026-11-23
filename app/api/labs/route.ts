import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await prisma.lab.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        country: true,
        website: true,
        _count: { select: { models: true } },
      },
    });
    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/labs failed", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}