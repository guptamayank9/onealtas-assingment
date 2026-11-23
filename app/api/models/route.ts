import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";


const MODEL_TYPES = [
  "TEXT", "IMAGE", "EMBEDDING", "VIDEO",
  "SPEECH", "TRANSCRIPTION", "RERANKING", "REALTIME",
];

const SORTS: Record<string, Prisma.ModelOrderByWithRelationInput> = {
  price_asc: { minInputPrice: { sort: "asc", nulls: "last" } },
  price_desc: { minInputPrice: { sort: "desc", nulls: "last" } },
  context_desc: { contextWindow: { sort: "desc", nulls: "last" } },
  context_asc: { contextWindow: { sort: "asc", nulls: "last" } },
  newest: { releasedAt: { sort: "desc", nulls: "last" } },
  oldest: { releasedAt: { sort: "asc", nulls: "last" } },
};

const toInt = (v: string | null, fallback: number, min: number, max: number) => {
  const n = parseInt(v ?? "", 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;

    const page = toInt(sp.get("page"), 1, 1, 10000);
    const limit = toInt(sp.get("limit"), 12, 1, 50);

    const q = sp.get("q")?.trim();
    const lab = sp.get("lab");
    const provider = sp.get("provider");
    const type = sp.get("type")?.toUpperCase();
    const sort = sp.get("sort") ?? "newest";

    if (type && !MODEL_TYPES.includes(type)) {
      return NextResponse.json({ error: `Invalid type: ${type}` }, { status: 400 });
    }
    if (!SORTS[sort]) {
      return NextResponse.json({ error: `Invalid sort: ${sort}` }, { status: 400 });
    }

    const where: Prisma.ModelWhereInput = {};

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { lab: { name: { contains: q, mode: "insensitive" } } },
      ];
    }
    if (lab) where.lab = { slug: lab };
    if (provider) where.providers = { some: { provider: { slug: provider } } };
    if (type) where.type = type as Prisma.ModelWhereInput["type"];

    if (sp.get("reasoning") === "true") where.reasoning = true;
    if (sp.get("toolCalling") === "true") where.toolCalling = true;
    if (sp.get("vision") === "true") where.vision = true;
    if (sp.get("openWeights") === "true") where.openWeights = true;
    if (sp.get("hideDeprecated") === "true") where.deprecated = false;

    const [total, data] = await Promise.all([
      prisma.model.count({ where }),
      prisma.model.findMany({
        where,
        orderBy: SORTS[sort],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          contextWindow: true,
          maxOutputTokens: true,
          reasoning: true,
          toolCalling: true,
          vision: true,
          openWeights: true,
          minInputPrice: true,
          minOutputPrice: true,
          providerCount: true,
          releasedAt: true,
          lab: { select: { name: true, slug: true } },
        },
      }),
    ]);

    return NextResponse.json({
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("GET /api/models failed", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}