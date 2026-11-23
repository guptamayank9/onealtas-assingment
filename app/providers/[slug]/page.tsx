import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProviderBySlug } from "@/lib/directory";
import { formatContext, formatPrice } from "@/lib/format";

async function ProviderDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const provider = await getProviderBySlug(slug);
  if (!provider) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{provider.name}</h1>
        {provider.website && (
          <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 underline">
            Website
          </a>
        )}
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Supported models ({provider.listings.length})</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Context</th>
                <th className="px-4 py-3">Input / 1M</th>
                <th className="px-4 py-3">Output / 1M</th>
              </tr>
            </thead>
            <tbody>
              {provider.listings.map((l) => (
                <tr key={l.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/models/${l.model.slug}`} className="font-medium hover:underline">{l.model.name}</Link>
                    <div className="text-xs text-gray-500">{l.model.lab.name}</div>
                  </td>
                  <td className="px-4 py-3">{l.model.type[0] + l.model.type.slice(1).toLowerCase()}</td>
                  <td className="px-4 py-3">{formatContext(l.model.contextWindow)}</td>
                  <td className="px-4 py-3">{formatPrice(l.inputPricePer1M)}</td>
                  <td className="px-4 py-3">{formatPrice(l.outputPricePer1M)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function ProviderPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <main className="mx-auto min-h-screen max-w-4xl bg-white px-4 py-8 text-gray-900">
      <Link href="/providers" className="mb-6 inline-block text-sm text-gray-500 hover:underline">&larr; All providers</Link>
      <Suspense fallback={<p className="text-sm text-gray-500">Loading...</p>}>
        <ProviderDetail params={params} />
      </Suspense>
    </main>
  );
}