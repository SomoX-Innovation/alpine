import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const useUnoptimized = product.image.includes("/storage/v1/object/public/");

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block"
      aria-label={`View ${product.name}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-[var(--muted-bg)]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          unoptimized={useUnoptimized}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span
            className={`absolute left-3 top-3 rounded px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${product.badge === "Sale"
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "bg-[var(--gold-soft)] text-[var(--foreground)]"
              }`}
          >
            {product.badge}
          </span>
        )}
        {product.compareAtPrice != null && product.badge !== "Sale" && (
          <span className="absolute right-3 top-3 rounded bg-[var(--foreground)] px-2.5 py-1 text-xs font-semibold text-[var(--background)]">
            Sale
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-col gap-0.5">
        <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
          {product.category}
          {product.colors && product.colors.length > 0 ? ` · ${product.colors.join(", ")}` : ""}
          <span className={product.quantity === 0 ? "text-red-500" : ""}>
            {" "}· {product.quantity === 0 ? "Out of stock" : `${product.quantity} in stock`}
          </span>
        </p>
        <h3 className="font-display text-lg font-medium text-[var(--foreground)] group-hover:text-[var(--accent)]">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--foreground)]">
            {product.priceFormatted}
          </span>
          {product.compareAtPrice != null && (
            <span className="text-xs text-[var(--muted)] line-through">
              Rs.{product.compareAtPrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
