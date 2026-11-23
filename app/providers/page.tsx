import { Suspense } from "react";
import Link from "next/link";
import { getProviders } from "@/lib/directory";

async function ProvidersGrid() {
  const providers = await getProviders();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {providers.map((p) => (
        <Link key={p.id} href={`/providers/${p.slug}`} className="rounded-lg border border-gray-200 p-4 hover:border-indigo-400">
          <h2 className="font-semibold">{p.name}</h2>
          <p className="mt-1 text-sm text-gray-500">{p._count.listings} models available</p>
        </Link>
      ))}
    </div>
  );
}

export default function ProvidersPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl bg-white px-4 py-8 text-gray-900">
      <h1 className="text-2xl font-bold">Providers</h1>
      <p className="mb-6 text-sm text-gray-500">Platforms that serve models through an API.</p>
      <Suspense fallback={<p className="text-sm text-gray-500">Loading...</p>}>
        <ProvidersGrid />
      </Suspense>
    </main>
  );
}