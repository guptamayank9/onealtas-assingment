import { prisma } from "@/lib/prisma";

export async function getModelsBySlugs(slugs: string[]) {
  const models = await prisma.model.findMany({
    where: { slug: { in: slugs } },
    include: {
      lab: { select: { name: true, slug: true } },
      scores: { include: { benchmark: { select: { name: true, slug: true } } } },
    },
  });
  // Jis order mein user ne chuna, usi order mein wapas do
  return slugs
    .map((s) => models.find((m) => m.slug === s))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));
}