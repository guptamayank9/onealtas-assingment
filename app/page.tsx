import { Suspense } from "react";
import ModelsExplorer from "@/components/ModelsExplorer";

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl bg-white px-4 py-8 text-gray-900">
      <h1 className="text-2xl font-bold">OneAtlas</h1>
      <p className="mb-6 text-sm text-gray-500">Every AI model, side by side.</p>
      <Suspense fallback={<p className="text-sm text-gray-500">Loading...</p>}>
        <ModelsExplorer />
      </Suspense>
    </main>
  );
}