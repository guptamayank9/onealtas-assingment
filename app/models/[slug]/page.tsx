import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getModelBySlug } from "@/lib/models";

const formatContext = (n: number | null) => {
  if (!n) return "-";
  if (n >= 1_000_000) return `${n / 1_000_000}M tokens`;
  return `${Math.round(n / 1000)}K tokens`;
};

const price = (n: number | null) => (n === null ? "-" : `$${n}`);

async function ModelDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const model = await getModelBySlug(slug);
  if (!model) notFound();

  const capabilities = [
    { label: "Reasoning", on: model.reasoning },
    { label: "Tool calling", on: model.toolCalling },
    { label: "Structured output", on: model.structuredOutput },
    { label: "Vision", on: model.vision },
    { label: "Open weights", on: model.openWeights },
  ];

  const specs = [
    ["Type", model.type[0] + model.type.slice(1).toLowerCase()],
    ["Context window", formatContext(model.contextWindow)],
    ["Max output", formatContext(model.maxOutputTokens)],
    ["Input modalities", model.inputModalities.join(", ") || "-"],
    ["Output modalities", model.outputModalities.join(", ") || "-"],
    [
      "Released",
      model.releasedAt
        ? model.releasedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
        : "-",
    ],
  ];

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/labs/${model.lab.slug}`} className="text-sm text-zinc-400 hover:underline">
          {model.lab.name}
        </Link>
        <h1 className="text-3xl font-bold">{model.name}</h1>
        {model.description && <p className="mt-2 text-zinc-400">{model.description}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {capabilities.map((c) => (
          <span
            key={c.label}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              c.on ? "border-indigo-400 bg-indigo-500 text-white" : "border-white/10 text-zinc-500 line-through"
            }`}
          >
            {c.label}
          </span>
        ))}
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Specifications</h2>
        <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-white/10 bg-zinc-900/10 sm:grid-cols-2">
          {specs.map(([k, v]) => (
            <div key={k} className="flex justify-between bg-zinc-900 px-4 py-3 text-sm">
              <dt className="text-zinc-400">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Providers and pricing</h2>
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="bg-zinc-900/5 text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Input / 1M</th>
                <th className="px-4 py-3">Output / 1M</th>
              </tr>
            </thead>
            <tbody>
              {model.providers.map((p) => (
                <tr key={p.id} className="border-t border-white/5">
                  <td className="px-4 py-3">
                    <Link href={`/providers/${p.provider.slug}`} className="hover:underline">
                      {p.provider.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{price(p.inputPricePer1M)}</td>
                  <td className="px-4 py-3">{price(p.outputPricePer1M)}</td>
                </tr>
              ))}
              {model.providers.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-zinc-400">No providers listed.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {model.scores.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Benchmarks</h2>
          <div className="space-y-3 rounded-lg border border-white/10 p-4">
            {model.scores.map((s) => (
              <div key={s.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>
                    {s.benchmark.name}
                    <span className="ml-2 text-xs text-zinc-500">{s.benchmark.category}</span>
                  </span>
                  <span className="font-medium">{s.score}</span>
                </div>
                <div className="h-2 rounded bg-zinc-900/10">
                  <div className="h-2 rounded bg-indigo-500" style={{ width: `${s.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function ModelPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <main className="mx-auto min-h-screen max-w-4xl bg-zinc-900 px-4 py-10text-gray-900">
      <Link href="/" className="mb-6 inline-block text-sm text-zinc-400 hover:underline">
        &larr; All models
      </Link>
      <Suspense fallback={<p className="text-sm text-zinc-400">Loading...</p>}>
        <ModelDetail params={params} />
      </Suspense>
    </main>
  );
}