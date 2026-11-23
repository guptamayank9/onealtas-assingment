"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ModelRow = {
  id: string;
  name: string;
  slug: string;
  type: string;
  contextWindow: number | null;
  reasoning: boolean;
  toolCalling: boolean;
  vision: boolean;
  openWeights: boolean;
  minInputPrice: number | null;
  minOutputPrice: number | null;
  providerCount: number;
  releasedAt: string | null;
  lab: { name: string; slug: string };
};

type Option = { name: string; slug: string };

const TYPES = ["TEXT", "IMAGE", "EMBEDDING", "VIDEO", "SPEECH", "TRANSCRIPTION", "RERANKING", "REALTIME"];

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "context_desc", label: "Context: largest" },
  { value: "context_asc", label: "Context: smallest" },
];

const TOGGLES = [
  { key: "reasoning", label: "Reasoning" },
  { key: "toolCalling", label: "Tool calling" },
  { key: "vision", label: "Vision" },
  { key: "openWeights", label: "Open weights" },
  { key: "hideDeprecated", label: "Hide deprecated" },
];

const formatContext = (n: number | null) => {
  if (!n) return "-";
  if (n >= 1_000_000) return `${n / 1_000_000}M`;
  return `${Math.round(n / 1000)}K`;
};

const formatPrice = (n: number | null) => (n === null ? "-" : `$${n}`);

export default function ModelsExplorer() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [labs, setLabs] = useState<Option[]>([]);
  const [providers, setProviders] = useState<Option[]>([]);
  const [rows, setRows] = useState<ModelRow[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(params.get("q") ?? "");

  const query = params.toString();

  // URL ko update karta hai. Filters URL mein rehte hain, to link share ho sakta hai
  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (!("page" in changes)) next.delete("page");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  // Dropdown options sirf ek baar load hote hain
  useEffect(() => {
    fetch("/api/labs").then((r) => r.json()).then((j) => setLabs(j.data ?? []));
    fetch("/api/providers").then((r) => r.json()).then((j) => setProviders(j.data ?? []));
  }, []);

  // Search debounce: typing rukne ke 300ms baad hi API call
  useEffect(() => {
    if (search === (params.get("q") ?? "")) return;
    const t = setTimeout(() => update({ q: search.trim() || null }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // URL badalte hi models fetch hote hain
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`/api/models?${query}`, { signal: controller.signal })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Something went wrong");
        setRows(json.data);
        setMeta(json.meta);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [query]);

  const selectClass = "rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-sm";

  return (
    <div className="space-y-4">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search models or labs..."
        className="w-full rounded-md border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-indigo-400"
      />

      <div className="flex flex-wrap gap-2">
        <select className={selectClass} value={params.get("lab") ?? ""} onChange={(e) => update({ lab: e.target.value || null })}>
          <option value="">All labs</option>
          {labs.map((l) => <option key={l.slug} value={l.slug}>{l.name}</option>)}
        </select>

        <select className={selectClass} value={params.get("provider") ?? ""} onChange={(e) => update({ provider: e.target.value || null })}>
          <option value="">All providers</option>
          {providers.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
        </select>

        <select className={selectClass} value={params.get("type") ?? ""} onChange={(e) => update({ type: e.target.value || null })}>
          <option value="">All types</option>
          {TYPES.map((t) => <option key={t} value={t}>{t[0] + t.slice(1).toLowerCase()}</option>)}
        </select>

        <select className={selectClass} value={params.get("sort") ?? "newest"} onChange={(e) => update({ sort: e.target.value })}>
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {TOGGLES.map((t) => {
          const active = params.get(t.key) === "true";
          return (
            <button
              key={t.key}
              onClick={() => update({ [t.key]: active ? null : "true" })}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                active ? "border-indigo-400 bg-indigo-500 text-white" : "border-white/10 bg-zinc-900 text-gray-700 hover:border-gray-500"
              }`}
            >
              {t.label}
            </button>
          );
        })}
        {query && (
          <button onClick={() => { setSearch(""); router.replace(pathname); }} className="px-2 text-xs text-zinc-400 underline">
            Clear all
          </button>
        )}
      </div>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-zinc-900/5 text-xs uppercase text-zinc-400">
            <tr>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Context</th>
              <th className="px-4 py-3">Input / Output (per 1M)</th>
              <th className="px-4 py-3">Providers</th>
              <th className="px-4 py-3">Released</th>
            </tr>
          </thead>
          <tbody className={loading ? "opacity-50" : ""}>
            {rows.map((m) => (
              <tr key={m.id} className="border-t border-white/5 hover:bg-zinc-900/5">
                <td className="px-4 py-3">
                  <Link href={`/models/${m.slug}`} className="font-medium hover:underline">{m.name}</Link>
                  <div className="text-xs text-zinc-400">{m.lab.name}</div>
                </td>
                <td className="px-4 py-3">{m.type[0] + m.type.slice(1).toLowerCase()}</td>
                <td className="px-4 py-3">{formatContext(m.contextWindow)}</td>
                <td className="px-4 py-3">{formatPrice(m.minInputPrice)} / {formatPrice(m.minOutputPrice)}</td>
                <td className="px-4 py-3">{m.providerCount}</td>
                <td className="px-4 py-3">{m.releasedAt ? new Date(m.releasedAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "-"}</td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-zinc-400">No models match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-zinc-400">
        <span>{meta.total} models</span>
        <div className="flex items-center gap-2">
          <button
            disabled={meta.page <= 1}
            onClick={() => update({ page: String(meta.page - 1) })}
            className="rounded-md border border-white/10 px-3 py-1 disabled:opacity-40"
          >
            Prev
          </button>
          <span>Page {meta.page} of {meta.totalPages}</span>
          <button
            disabled={meta.page >= meta.totalPages}
            onClick={() => update({ page: String(meta.page + 1) })}
            className="rounded-md border border-white/10 px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}