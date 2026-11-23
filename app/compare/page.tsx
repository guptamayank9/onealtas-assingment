import { Suspense } from "react";
import Link from "next/link";
import { getModelsBySlugs } from "@/lib/models";
import { formatContext, formatPrice } from "@/lib/format";

type CompareModel = Awaited<ReturnType<typeof getModelsBySlugs>>[number];

const yesNo = (v: boolean) => (v ? "Yes" : "No");

const rows: { label: string; render: (m: CompareModel) => string }[] = [
  { label: "Lab", render: (m) => m.lab.name },
  { label: "Type", render: (m) => m.type[0] + m.type.slice(1).toLowerCase() },
  { label: "Input price / 1M (from)", render: (m) => formatPrice(m.minInputPrice) },
  { label: "Output price / 1M (from)", render: (m) => formatPrice(m.minOutputPrice) },
  { label: "Context window", render: (m) => formatContext(m.contextWindow) },
  { label: "Max output", render: (m) => formatContext(m.maxOutputTokens) },
  { label: "Input modalities", render: (m) => m.inputModalities.join(", ") || "-" },
  { label: "Reasoning", render: (m) => yesNo(m.reasoning) },
  { label: "Tool calling", render: (m) => yesNo(m.toolCalling) },
  { label: "Structured output", render: (m) => yesNo(m.structuredOutput) },
  { label: "Vision", render: (m) => yesNo(m.vision) },
  { label: "Open weights", render: (m) => yesNo(m.openWeights) },
  { label: "Providers", render: (m) => String(m.providerCount) },
  {
    label: "Released",
    render: (m) =>
      m.releasedAt ? m.releasedAt.toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "-",
  },
];

async function CompareTable({ searchParams }: { searchParams: Promise<{ models?: string }> }) {
  const { models: param } = await searchParams;
  const slugs = [...new Set((param ?? "").split(",").map((s) => s.trim()).filter(Boolean))].slice(0, 4);
  const models = slugs.length ? await getModelsBySlugs(slugs) : [];

  if (models.length < 2) {
    return (
      <div className="rounded-lg border border-dashed border-white/10 p-10 text-center text-gray-500">
        Select at least 2 models from the{" "}
        <Link href="/" className="underline">models list</Link> to compare them.
      </div>
    );
  }

  // Sab models ke benchmarks ka union
  const benchmarks = new Map<string, string>();
  models.forEach((m) => m.scores.forEach((s) => benchmarks.set(s.benchmark.slug, s.benchmark.name)));

  const cell = "px-4 py-3 align-top";

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className={`${cell} text-xs uppercase text-gray-500`}>Spec</th>
            {models.map((m) => (
              <th key={m.id} className={cell}>
                <Link href={`/models/${m.slug}`} className="font-semibold hover:underline">{m.name}</Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-t border-gray-100">
              <td className={`${cell} text-gray-500`}>{r.label}</td>
              {models.map((m) => (
                <td key={m.id} className={cell}>{r.render(m)}</td>
              ))}
            </tr>
          ))}

          {benchmarks.size > 0 && (
            <tr className="border-t border-gray-200 bg-gray-50">
              <td colSpan={models.length + 1} className="px-4 py-2 text-xs font-semibold uppercase text-gray-500">
                Benchmarks (higher is better)
              </td>
            </tr>
          )}

          {[...benchmarks].map(([slug, name]) => {
            const scores = models.map((m) => m.scores.find((s) => s.benchmark.slug === slug)?.score ?? null);
            const valid = scores.filter((s): s is number => s !== null);
            const best = valid.length ? Math.max(...valid) : null;
            return (
              <tr key={slug} className="border-t border-gray-100">
                <td className={`${cell} text-gray-500`}>{name}</td>
                {scores.map((s, i) => (
                  <td key={models[i].id} className={`${cell} ${s !== null && s === best ? "font-bold" : ""}`}>
                    {s ?? "-"}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ComparePage({ searchParams }: { searchParams: Promise<{ models?: string }> }) {
  return (
    <main className="mx-auto min-h-screen max-w-6xl bg-white px-4 py-8 text-gray-900">
      <Link href="/" className="mb-6 inline-block text-sm text-gray-500 hover:underline">&larr; All models</Link>
      <h1 className="mb-6 text-2xl font-bold">Compare models</h1>
      <Suspense fallback={<p className="text-sm text-gray-500">Loading...</p>}>
        <CompareTable searchParams={searchParams} />
      </Suspense>
    </main>
  );
}