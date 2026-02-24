import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchContent from "@/components/SearchContent";
import { searchProducts } from "@/lib/products-db";
import { searchProducts as searchStatic } from "@/lib/products";

export const metadata = {
  title: "Search — Alpine",
  description: "Search our collection.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  let results = await searchProducts(q);
  if (results.length === 0 && q.trim()) results = searchStatic(q);
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8">Loading...</div>}>
          <SearchContent initialQuery={q} initialResults={results} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
