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
  `rounded-full border px-3 py-1 text-xs font-medium transition ${
    active
      ? "border-indigo-400 bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
      : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-white"
  }`;

const medal = (rank: number) =>
  rank === 1
    ? "bg-amber-400/20 text-amber-300 ring-amber-400/30"
    : rank === 2
    ? "bg-zinc-300/15 text-zinc-200 ring-zinc-300/30"
    : rank === 3
    ? "bg-orange-500/15 text-orange-300 ring-orange-400/30"
    : "text-zinc-500 ring-transparent";

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
          <span className="w-20 text-xs uppercase tracking-wide text-zinc-500">Category</span>
          <Link href={href({})} className={chip(!activeCategory)}>All</Link>
          {categories.map((c) => (
            <Link key={c} href={href({ category: c })} className={chip(activeCategory === c)}>{c}</Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-20 text-xs uppercase tracking-wide text-zinc-500">Benchmark</span>
          <Link href={href({ category: activeCategory })} className={chip(!active)}>Overall (avg)</Link>
          {visible.map((b) => (
            <Link key={b.id} href={href({ category: activeCategory, benchmark: b.slug })} className={chip(active?.slug === b.slug)}>
              {b.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-zinc-900/[0.02] backdrop-blur">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="w-16 px-4 py-3">#</th>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Input / 1M (from)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.model.id}
                className="animate-fade-up border-t border-white/5 transition hover:bg-zinc-900/[0.04]"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <td className="px-4 py-3">
                  <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ring-1 ${medal(r.rank)}`}>
                    {r.rank}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/30 text-sm font-semibold text-white ring-1 ring-white/10">
                      {r.model.lab.name[0]}
                    </span>
                    <div>
                      <Link href={`/models/${r.model.slug}`} className="font-medium text-white hover:text-indigo-300">
                        {r.model.name}
                      </Link>
                      <div className="text-xs text-zinc-500">{r.model.lab.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 font-semibold text-white">{r.score}</span>
                    <div className="h-2 w-36 overflow-hidden rounded-full bg-zinc-900/10">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                        style={{ width: `${r.score}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-300">{formatPrice(r.model.minInputPrice)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-14 text-center text-zinc-500">No scores available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-zinc-500">Scores are mock data for demo purposes.</p>
    </div>
  );
}

export default function RankingsPage({ searchParams }: { searchParams: SP }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-3xl font-bold text-transparent">
        Rankings
      </h1>
      <p className="mb-6 mt-1 text-sm text-zinc-400">Leaderboards by benchmark and category.</p>
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading...</p>}>
        <Leaderboard searchParams={searchParams} />
      </Suspense>
    </main>
  );
}