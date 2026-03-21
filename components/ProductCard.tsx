"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";

const SLIDE_MS = 2000;

function slideshowUrls(product: Product): string[] {
  const raw =
    Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image];
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const u of raw) {
    if (typeof u === "string" && u.trim() && !seen.has(u)) {
      seen.add(u);
      urls.push(u.trim());
    }
  }
  if (urls.length === 0 && product.image?.trim()) urls.push(product.image.trim());
  return urls;
}

function isUnoptimized(src: string) {
  return src.includes("/storage/v1/object/public/");
}

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const slides = useMemo(() => slideshowUrls(product), [product]);
  const multi = slides.length > 1;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!multi || paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [multi, paused, slides.length]);

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block"
      aria-label={`View ${product.name}`}
    >
      <div
        className="relative aspect-[3/4] overflow-hidden rounded-lg bg-[var(--muted-bg)]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative h-full w-full transition-transform duration-500 group-hover:scale-105">
          {slides.map((src, i) => (
            <Image
              key={`${src}-${i}`}
              src={src}
              alt={i === index ? product.name : ""}
              fill
              unoptimized={isUnoptimized(src)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`absolute inset-0 object-cover transition-opacity duration-500 ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={i !== index}
            />
          ))}
        </div>

        {multi && (
          <div
            className="pointer-events-none absolute bottom-2 left-0 right-0 flex justify-center gap-1.5"
            aria-hidden
          >
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === index ? "bg-white shadow-sm" : "bg-white/45"
                }`}
              />
            ))}
          </div>
        )}

        {product.badge && (
          <span
            className={`absolute left-3 top-3 z-[1] rounded px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
              product.badge === "Sale"
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "bg-[var(--gold-soft)] text-[var(--foreground)]"
            }`}
          >
            {product.badge}
          </span>
        )}
        {product.compareAtPrice != null && product.badge !== "Sale" && (
          <span className="absolute right-3 top-3 z-[1] rounded bg-[var(--foreground)] px-2.5 py-1 text-xs font-semibold text-[var(--background)]">
            Sale
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-col gap-0.5">
        <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
          {product.category}
          {product.colors && product.colors.length > 0 ? ` · ${product.colors.join(", ")}` : ""}
        </p>
        <h3 className="font-display text-lg font-medium text-[var(--foreground)] group-hover:text-[var(--accent)]">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--foreground)]">{product.priceFormatted}</span>
          {product.compareAtPrice != null && (
            <span className="text-xs text-[var(--muted)] line-through">Rs.{product.compareAtPrice}</span>
          )}
        </div>
        <p className="mt-1 text-xs uppercase tracking-wider text-[var(--muted)]">
          {product.orderedQuantity ?? 0} ordered
        </p>
      </div>
    </Link>
  );
}
