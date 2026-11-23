import { prisma } from "@/lib/prisma";

export const getLabs = () =>
  prisma.lab.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { models: true } } },
  });

export const getLabBySlug = (slug: string) =>
  prisma.lab.findUnique({
    where: { slug },
    include: {
      models: {
        orderBy: { releasedAt: { sort: "desc", nulls: "last" } },
        select: {
          id: true, name: true, slug: true, type: true,
          contextWindow: true, minInputPrice: true, minOutputPrice: true, releasedAt: true,
        },
      },
    },
  });

export const getProviders = () =>
  prisma.provider.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { listings: true } } },
  });

export const getProviderBySlug = (slug: string) =>
  prisma.provider.findUnique({
    where: { slug },
    include: {
      listings: {
        orderBy: { inputPricePer1M: "asc" },
        include: {
          model: {
            select: { name: true, slug: true, type: true, contextWindow: true, lab: { select: { name: true } } },
          },
        },
      },
    },
  });