import { prisma } from "@/lib/prisma";

export async function getModelBySlug(slug: string) {
  return prisma.model.findUnique({
    where: { slug },
    include: {
      lab: { select: { name: true, slug: true, country: true, website: true } },
      providers: {
        orderBy: { inputPricePer1M: "asc" },
        include: { provider: { select: { name: true, slug: true, website: true } } },
      },
      scores: {
        orderBy: { score: "desc" },
        include: { benchmark: { select: { name: true, slug: true, category: true } } },
      },
    },
  });
}