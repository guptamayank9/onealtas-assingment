import { prisma } from "@/lib/prisma";

export const getBenchmarks = () =>
  prisma.benchmark.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });

const modelSelect = {
  id: true,
  name: true,
  slug: true,
  minInputPrice: true,
  contextWindow: true,
  lab: { select: { name: true } },
} as const;

export async function getLeaderboard(opts: {
  benchmark?: string | null;
  category?: string | null;
  limit?: number;
}) {
  const limit = opts.limit ?? 20;

  // Ek specific benchmark
  if (opts.benchmark) {
    const rows = await prisma.benchmarkScore.findMany({
      where: { benchmark: { slug: opts.benchmark } },
      orderBy: { score: "desc" },
      take: limit,
      include: { model: { select: modelSelect } },
    });
    return rows.map((r, i) => ({ rank: i + 1, score: r.score, model: r.model }));
  }

  // Overall: average score (category ho to sirf us category ke benchmarks ka)
  const grouped = await prisma.benchmarkScore.groupBy({
    by: ["modelId"],
    where: opts.category ? { benchmark: { category: opts.category } } : undefined,
    _avg: { score: true },
    orderBy: { _avg: { score: "desc" } },
    take: limit,
  });

  const models = await prisma.model.findMany({
    where: { id: { in: grouped.map((g) => g.modelId) } },
    select: modelSelect,
  });

  return grouped
    .map((g, i) => ({
      rank: i + 1,
      score: Math.round((g._avg.score ?? 0) * 10) / 10,
      model: models.find((m) => m.id === g.modelId),
    }))
    .filter((r): r is typeof r & { model: NonNullable<typeof r.model> } => Boolean(r.model));
}