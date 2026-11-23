import { Suspense } from "react";
import Link from "next/link";
import { getBenchmarks, getLeaderboard } from "@/lib/rankings";
import { formatPrice } from "@/lib/format";

type SP = Promise<{ benchmark?: string; category?: string }>;

function href(params: { benchmark?: string | null; category?: string | null }) {
  const q = new URLSearchParams();
  if (params.category) q.set("category", params.category);
  if (params.benchmark) q.set("benchmark", params.benchmark);
  const s = q.toString();
  return s ? `/rankings?${s}` : "/rankings";
}

const chip = (active: boolean) =>
  `rounded-full border px-3 py-1 text-xs font-medium ${
    active ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 bg-white text-gray-700 hover:border-gray-500"
  }`;

async function Leaderboard({ searchParams }: { searchParams: SP }) {
  const { benchmark, category } = await searchParams;
  const benchmarks = await getBenchmarks();
  const categories = [...new Set(benchmarks.map((b) => b.category))];

  const activeCategory = categories.includes(category ?? "") ? category! : null;
  const visible = activeCategory ? benchmarks.filter((b) => b.category === activeCategory) : benchmarks;
  const active = visible.find((b) => b.slug === benchmark) ?? null;

  const rows = await getLeaderboard({ benchmark: active?.slug, category: activeCategory });

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-20 text-xs uppercase text-gray-500">Category</span>
          <Link href={href({})} className={chip(!activeCategory)}>All</Link>
          {categories.map((c) => (
            <Link key={c} href={href({ category: c })} className={chip(activeCategory === c)}>{c}</Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-20 text-xs uppercase text-gray-500">Benchmark</span>
          <Link href={href({ category: activeCategory })} className={chip(!active)}>Overall (avg)</Link>
          {visible.map((b) => (
            <Link key={b.id} href={href({ category: activeCategory, benchmark: b.slug })} className={chip(active?.slug === b.slug)}>
              {b.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="w-14 px-4 py-3">#</th>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Input / 1M (from)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.model.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-500">{r.rank}</td>
                <td className="px-4 py-3">
                  <Link href={`/models/${r.model.slug}`} className="font-medium hover:underline">{r.model.name}</Link>
                  <div className="text-xs text-gray-500">{r.model.lab.name}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 font-medium">{r.score}</span>
                    <div className="h-2 w-32 rounded bg-gray-100">
                      <div className="h-2 rounded bg-gray-900" style={{ width: `${r.score}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{formatPrice(r.model.minInputPrice)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-gray-500">No scores available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500">Scores are mock data for demo purposes.</p>
    </div>
  );
}

export default function RankingsPage({ searchParams }: { searchParams: SP }) {
  return (
    <main className="mx-auto min-h-screen max-w-6xl bg-white px-4 py-8 text-gray-900">
      <h1 className="text-2xl font-bold">Rankings</h1>
      <p className="mb-6 text-sm text-gray-500">Leaderboards by benchmark and category.</p>
      <Suspense fallback={<p className="text-sm text-gray-500">Loading...</p>}>
        <Leaderboard searchParams={searchParams} />
      </Suspense>
    </main>
  );
}