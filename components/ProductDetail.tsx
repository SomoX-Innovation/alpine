"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { CURRENCY } from "@/lib/currency";
import { productFitList, type Product, type ProductFit } from "@/lib/types";

type ProductDetailProps = { product: Product };

export default function ProductDetail({ product }: ProductDetailProps) {
  const fitsList = productFitList(product);
  const [selectedFit, setSelectedFit] = useState<ProductFit | null>(
    fitsList.length >= 1 ? fitsList[0] : null
  );
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] ?? "One Size");
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] ?? "");
  const maxQty = typeof product.quantity === "number" ? product.quantity : 999;
  const [quantity, setQuantity] = useState(Math.min(1, maxQty));
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const outOfStock = maxQty === 0;
  const images = product.images.length > 0 ? product.images : [product.image];
  const colorImage = selectedColor ? product.colorImages?.[selectedColor] : undefined;
  const mainImage = colorImage || images[0] || product.image;
  const useUnoptimized = mainImage.includes("/storage/v1/object/public/");

  function handleAddToCart() {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: mainImage,
      size: selectedSize,
      quantity,
      ...(selectedFit ? { fit: selectedFit } : {}),
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div suppressHydrationWarning className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <nav className="mb-6 text-sm text-[var(--muted)]" aria-label="Breadcrumb">
        <ol className="flex flex-wrap gap-2">
          <li>
            <Link href="/" className="hover:text-[var(--accent)]">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link
              href={product.category === "Women" ? "/women" : product.category === "Men" ? "/men" : "/new-arrivals"}
              className="hover:text-[var(--accent)]"
            >
              {product.category}
            </Link>
          </li>
          <li>/</li>
          <li className="text-[var(--foreground)]">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Gallery */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[var(--muted-bg)]">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            priority
            unoptimized={useUnoptimized}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          {product.badge && (
            <span
              className={`absolute left-4 top-4 rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${product.badge === "Sale"
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "bg-[var(--gold-soft)] text-[var(--foreground)]"
                }`}
            >
              {product.badge}
            </span>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
            {product.category} {product.colors && product.colors.length > 0 ? `· ${product.colors.join(", ")}` : ""}
          </p>
          <h1 className="font-display mt-1 text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
            {product.name}
          </h1>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-xl font-semibold text-[var(--foreground)]">
              {product.priceFormatted}
            </span>
            {product.compareAtPrice != null && (
              <span className="text-base text-[var(--muted)] line-through">
                Rs.{product.compareAtPrice}
              </span>
            )}
          </div>

          {typeof product.quantity === "number" && (
            <p className="mt-2 text-sm text-[var(--muted)]">
              {product.quantity === 0 ? (
                <span className="text-red-500 font-medium">Out of stock</span>
              ) : (
                <span>{product.quantity} in stock</span>
              )}
              {typeof product.orderedQuantity === "number" &&
                product.orderedQuantity > 0 && (
                  <span className="block mt-1">
                    {product.orderedQuantity} ordered
                  </span>
                )}
            </p>
          )}

          <p className="mt-6 text-[var(--foreground)]/90">{product.description}</p>

          {fitsList.length > 1 && (
            <div className="mt-8">
              <label className="text-sm font-semibold text-[var(--foreground)]">
                Fit
              </label>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Same photos apply to every fit; choose how you want this item listed in your order.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {fitsList.map((fit) => (
                  <button
                    key={fit}
                    type="button"
                    onClick={() => setSelectedFit(fit)}
                    className={`rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${selectedFit === fit
                      ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--accent)]"
                      }`}
                  >
                    {fit}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div className="mt-8">
              <label className="text-sm font-semibold text-[var(--foreground)]">
                Color
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${selectedColor === color
                      ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--accent)]"
                      }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-[var(--foreground)]">
                Size
              </label>
              <Link
                href="/size-guide"
                className="text-sm text-[var(--accent)] hover:underline"
              >
                Size guide
              </Link>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[3rem] rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${selectedSize === size
                    ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                    : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--accent)]"
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          {!outOfStock && (
            <div className="mt-6">
              <label className="text-sm font-semibold text-[var(--foreground)]">
                Quantity
              </label>
              <div className="mt-2 flex w-32 items-center rounded-md border border-[var(--border)] bg-[var(--card)]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-10 items-center justify-center text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="flex-1 text-center text-sm font-medium">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  className="flex h-10 w-10 items-center justify-center text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Add to cart */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="flex-1 rounded-md bg-[var(--foreground)] px-6 py-3.5 text-sm font-semibold text-[var(--background)] transition-colors hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {outOfStock ? "Out of stock" : added ? "Added to cart" : "Add to cart"}
            </button>
            <Link
              href="/cart"
              className="flex flex-1 items-center justify-center rounded-md border border-[var(--border)] px-6 py-3.5 text-sm font-semibold text-[var(--foreground)] hover:border-[var(--accent)] hover:bg-[var(--muted-bg)]"
            >
              View cart
            </Link>
          </div>

          <ul className="mt-8 space-y-2 border-t border-[var(--border)] pt-8 text-sm text-[var(--muted)]">
            <li>Free shipping on orders over {CURRENCY.symbol} {CURRENCY.freeShippingThreshold.toLocaleString()}</li>
            <li>7-day easy returns</li>
            <li>Secure payment</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
