"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

type Props = {
  initialQuery: string;
  initialResults: Product[];
};

export default function SearchContent({ initialQuery, initialResults }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
        Search
      </h1>
      <form className="mt-4" onSubmit={handleSubmit} role="search">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] sm:max-w-md"
          aria-label="Search products"
          autoFocus
        />
      </form>
      {initialQuery.trim() && (
        <p className="mt-4 text-sm text-[var(--muted)]">
          {initialResults.length} {initialResults.length === 1 ? "result" : "results"}
        </p>
      )}
      <div className="mt-8 grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-3 lg:grid-cols-4">
        {initialResults.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {initialQuery.trim() && initialResults.length === 0 && (
        <p className="py-12 text-center text-[var(--muted)]">
          No products found for &quot;{initialQuery}&quot;. Try a different term.
        </p>
      )}
    </div>
  );
}
