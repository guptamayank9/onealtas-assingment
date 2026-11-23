import { Suspense } from "react";
import Link from "next/link";
import { getLabs } from "@/lib/directory";

async function LabsGrid() {
  const labs = await getLabs();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {labs.map((l) => (
        <Link key={l.id} href={`/labs/${l.slug}`} className="rounded-lg border border-gray-200 p-4 hover:border-indigo-400">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold">{l.name}</h2>
            <span className="text-xs text-gray-500">{l.country}</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">{l._count.models} models</p>
        </Link>
      ))}
    </div>
  );
}

export default function LabsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl bg-white px-4 py-8 text-gray-900">
      <h1 className="text-2xl font-bold">AI Labs</h1>
      <p className="mb-6 text-sm text-gray-500">Research labs and companies building models.</p>
      <Suspense fallback={<p className="text-sm text-gray-500">Loading...</p>}>
        <LabsGrid />
      </Suspense>
    </main>
  );
}