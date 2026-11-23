import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client"; // output path ke hisaab se badlo

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// Simple deterministic "random", taaki har seed run pe same data bane
let seed = 42;
const rand = () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};
const jitter = (n: number, spread: number) => n + (rand() - 0.5) * spread;

const labs = [
  { name: "OpenAI", country: "US", website: "https://openai.com" },
  { name: "Anthropic", country: "US", website: "https://anthropic.com" },
  { name: "Google", country: "US", website: "https://deepmind.google" },
  { name: "Meta", country: "US", website: "https://ai.meta.com" },
  { name: "Mistral AI", country: "FR", website: "https://mistral.ai" },
  { name: "DeepSeek", country: "CN", website: "https://deepseek.com" },
  { name: "Alibaba Qwen", country: "CN", website: "https://qwenlm.github.io" },
  { name: "Cohere", country: "CA", website: "https://cohere.com" },
];

const providers = [
  "OpenAI API", "Anthropic API", "Google Vertex AI", "AWS Bedrock",
  "Azure AI", "Together AI", "Groq", "Fireworks", "DeepInfra", "OpenRouter",
];

const benchmarks = [
  { name: "MMLU-Pro", category: "Knowledge" },
  { name: "GPQA Diamond", category: "Reasoning" },
  { name: "HumanEval", category: "Coding" },
  { name: "SWE-bench Verified", category: "Coding" },
  { name: "MATH-500", category: "Math" },
];

type M = {
  name: string; lab: string; type?: string; ctx: number; out: number;
  reasoning?: boolean; tools?: boolean; vision?: boolean; open?: boolean;
  released: string; inPrice: number; outPrice: number; q: number;
};

// Sab MOCK data hai, real pricing/scores nahi
const models: M[] = [
  { name: "Atlas GPT Pro", lab: "OpenAI", ctx: 400000, out: 128000, reasoning: true, tools: true, vision: true, released: "2026-03-10", inPrice: 5, outPrice: 20, q: 92 },
  { name: "Atlas GPT Mini", lab: "OpenAI", ctx: 200000, out: 64000, tools: true, vision: true, released: "2026-03-10", inPrice: 0.4, outPrice: 1.6, q: 78 },
  { name: "Atlas GPT Nano", lab: "OpenAI", ctx: 128000, out: 16000, tools: true, released: "2026-01-20", inPrice: 0.1, outPrice: 0.4, q: 64 },
  { name: "Sage Opus", lab: "Anthropic", ctx: 1000000, out: 128000, reasoning: true, tools: true, vision: true, released: "2026-05-02", inPrice: 15, outPrice: 75, q: 94 },
  { name: "Sage Sonnet", lab: "Anthropic", ctx: 1000000, out: 64000, reasoning: true, tools: true, vision: true, released: "2026-05-02", inPrice: 3, outPrice: 15, q: 89 },
  { name: "Sage Haiku", lab: "Anthropic", ctx: 200000, out: 32000, tools: true, vision: true, released: "2026-04-11", inPrice: 0.8, outPrice: 4, q: 74 },
  { name: "Gemini Nova Pro", lab: "Google", ctx: 2000000, out: 64000, reasoning: true, tools: true, vision: true, released: "2026-04-18", inPrice: 2.5, outPrice: 12, q: 91 },
  { name: "Gemini Nova Flash", lab: "Google", ctx: 1000000, out: 32000, tools: true, vision: true, released: "2026-04-18", inPrice: 0.3, outPrice: 1.2, q: 80 },
  { name: "Gemma Open 27B", lab: "Google", ctx: 128000, out: 8000, open: true, vision: true, released: "2026-02-14", inPrice: 0.1, outPrice: 0.2, q: 70 },
  { name: "Llama Next 405B", lab: "Meta", ctx: 256000, out: 16000, open: true, tools: true, released: "2026-02-03", inPrice: 1.2, outPrice: 1.8, q: 82 },
  { name: "Llama Next 70B", lab: "Meta", ctx: 128000, out: 8000, open: true, tools: true, released: "2026-02-03", inPrice: 0.4, outPrice: 0.6, q: 75 },
  { name: "Llama Next 8B", lab: "Meta", ctx: 128000, out: 8000, open: true, released: "2026-02-03", inPrice: 0.05, outPrice: 0.08, q: 58 },
  { name: "Mistral Titan Large", lab: "Mistral AI", ctx: 128000, out: 16000, tools: true, released: "2026-01-09", inPrice: 2, outPrice: 6, q: 79 },
  { name: "Mistral Titan Small", lab: "Mistral AI", ctx: 64000, out: 8000, open: true, tools: true, released: "2025-12-05", inPrice: 0.2, outPrice: 0.6, q: 66 },
  { name: "DeepSeek Reason R2", lab: "DeepSeek", ctx: 128000, out: 32000, reasoning: true, open: true, released: "2026-03-28", inPrice: 0.55, outPrice: 2.2, q: 88 },
  { name: "DeepSeek Chat V4", lab: "DeepSeek", ctx: 128000, out: 16000, open: true, tools: true, released: "2026-01-27", inPrice: 0.27, outPrice: 1.1, q: 81 },
  { name: "Qwen Max", lab: "Alibaba Qwen", ctx: 256000, out: 32000, reasoning: true, tools: true, released: "2026-04-01", inPrice: 1.6, outPrice: 6.4, q: 86 },
  { name: "Qwen Open 72B", lab: "Alibaba Qwen", ctx: 128000, out: 8000, open: true, tools: true, released: "2026-02-20", inPrice: 0.4, outPrice: 0.8, q: 77 },
  { name: "Command Enterprise", lab: "Cohere", ctx: 128000, out: 4000, tools: true, released: "2026-01-15", inPrice: 2.5, outPrice: 10, q: 72 },
  { name: "Embed Atlas v3", lab: "Cohere", type: "EMBEDDING", ctx: 8000, out: 0, released: "2026-02-01", inPrice: 0.1, outPrice: 0, q: 0 },
  { name: "Atlas Embed Large", lab: "OpenAI", type: "EMBEDDING", ctx: 8000, out: 0, released: "2025-11-10", inPrice: 0.13, outPrice: 0, q: 0 },
  { name: "Atlas Image 2", lab: "OpenAI", type: "IMAGE", ctx: 4000, out: 0, released: "2026-03-01", inPrice: 4, outPrice: 0, q: 0 },
  { name: "Atlas Whisper v4", lab: "OpenAI", type: "TRANSCRIPTION", ctx: 0, out: 0, released: "2025-10-01", inPrice: 0.006, outPrice: 0, q: 0 },
  { name: "Mistral Rerank 2", lab: "Mistral AI", type: "RERANKING", ctx: 32000, out: 0, released: "2026-01-05", inPrice: 0.05, outPrice: 0, q: 0 },
];

async function main() {
  // Purane data hatao (children pehle)
  await prisma.benchmarkScore.deleteMany();
  await prisma.modelProvider.deleteMany();
  await prisma.model.deleteMany();
  await prisma.benchmark.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.lab.deleteMany();

  const labRows = await Promise.all(
    labs.map((l) => prisma.lab.create({ data: { ...l, slug: slugify(l.name), description: `${l.name} AI research lab.` } }))
  );
  const providerRows = await Promise.all(
    providers.map((p) => prisma.provider.create({ data: { name: p, slug: slugify(p), website: "https://example.com" } }))
  );
  const benchmarkRows = await Promise.all(
    benchmarks.map((b) => prisma.benchmark.create({ data: { ...b, slug: slugify(b.name), description: `${b.name} benchmark.` } }))
  );

  for (const m of models) {
    const lab = labRows.find((l) => l.name === m.lab)!;
    const type = (m.type ?? "TEXT") as any;

    const model = await prisma.model.create({
      data: {
        name: m.name,
        slug: `${lab.slug}-${slugify(m.name)}`,
        description: `${m.name} by ${m.lab}. Mock data for demo.`,
        type,
        contextWindow: m.ctx || null,
        maxOutputTokens: m.out || null,
        inputModalities: m.vision ? ["text", "image"] : ["text"],
        outputModalities: type === "IMAGE" ? ["image"] : type === "EMBEDDING" ? ["embedding"] : ["text"],
        reasoning: !!m.reasoning,
        toolCalling: !!m.tools,
        structuredOutput: !!m.tools,
        vision: !!m.vision,
        openWeights: !!m.open,
        releasedAt: new Date(m.released),
        labId: lab.id,
      },
    });

    // 2 se 5 random providers, har ek ka price thoda alag
    const count = 2 + Math.floor(rand() * 4);
    const picked = [...providerRows].sort(() => rand() - 0.5).slice(0, count);
       const rows = picked.map((p) => ({
      modelId: model.id,
      providerId: p.id,
      inputPricePer1M: +jitter(m.inPrice, m.inPrice * 0.3).toFixed(3),
      outputPricePer1M: m.outPrice ? +jitter(m.outPrice, m.outPrice * 0.3).toFixed(3) : null,
    }));
    await prisma.modelProvider.createMany({ data: rows });
    await prisma.model.update({
      where: { id: model.id },
      data: {
        providerCount: rows.length,
        minInputPrice: Math.min(...rows.map((r) => r.inputPricePer1M)),
        minOutputPrice: m.outPrice
          ? Math.min(...rows.map((r) => r.outputPricePer1M as number))
          : null,
      },
    });

    // Benchmark scores sirf TEXT models ke liye
    if (type === "TEXT") {
      await prisma.benchmarkScore.createMany({
        data: benchmarkRows.map((b) => ({
          modelId: model.id,
          benchmarkId: b.id,
          score: +Math.min(99, Math.max(10, jitter(m.q, 10))).toFixed(1),
        })),
      });
    }
  }

  console.log(`Seeded: ${labRows.length} labs, ${providerRows.length} providers, ${models.length} models, ${benchmarkRows.length} benchmarks`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());