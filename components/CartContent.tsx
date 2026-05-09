"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { CURRENCY } from "@/lib/currency";
import { cartLineUnitPrice, effectiveMaxCartQuantityForLine, type ProductFit } from "@/lib/types";

type ProductOptions = {
  sizes: string[];
  fits: ProductFit[];
  colors: string[];
  colorImages: Record<string, string>;
  images: string[];
  image: string;
  price: number;
  priceOversize: number | null;
  trackStock: boolean;
  stockQuantity: number;
  variantStock: Record<string, number>;
};

type EditState = {
  key: string;
  productId: string;
  oldSize: string;
  oldFit?: ProductFit;
  oldColor?: string;
  size: string;
  fit?: ProductFit;
  color?: string;
};

export default function CartContent({ isSignedIn = false }: { isSignedIn?: boolean }) {
  const { items, removeItem, updateQuantity, updateItemOptions } = useCart();
  const [editing, setEditing] = useState<EditState | null>(null);
  const [optionsByProduct, setOptionsByProduct] = useState<Record<string, ProductOptions>>({});
  const [loadingOptions, setLoadingOptions] = useState(false);
  const subtotal = items.reduce((sum, i) => sum + cartLineUnitPrice(i) * i.quantity, 0);
  const shipping = subtotal >= CURRENCY.freeShippingThreshold ? 0 : CURRENCY.shippingCost;
  const total = subtotal + shipping;

  const lineKey = (item: { productId: string; size: string; fit?: string; color?: string }) =>
    `${item.productId}-${item.size}-${item.fit ?? ""}-${item.color ?? ""}`;

  async function startEdit(item: {
    productId: string;
    size: string;
    fit?: ProductFit;
    color?: string;
  }) {
    const key = lineKey(item);
    setEditing({
      key,
      productId: item.productId,
      oldSize: item.size,
      oldFit: item.fit,
      oldColor: item.color,
      size: item.size,
      fit: item.fit,
      color: item.color,
    });
    if (optionsByProduct[item.productId]) return;
    setLoadingOptions(true);
    try {
      const res = await fetch(`/api/products/${item.productId}`);
      if (!res.ok) return;
      const data = (await res.json()) as ProductOptions;
      setOptionsByProduct((prev) => ({ ...prev, [item.productId]: data }));
    } finally {
      setLoadingOptions(false);
    }
  }

  function saveEdit(item: { productId: string; image: string }) {
    if (!editing) return;
    const opts = optionsByProduct[item.productId];
    const nextColor = editing.color || undefined;
    const nextImage =
      (nextColor && opts?.colorImages?.[nextColor]) ||
      opts?.images?.[0] ||
      opts?.image ||
      item.image;
    updateItemOptions(
      {
        productId: editing.productId,
        size: editing.oldSize,
        fit: editing.oldFit,
        color: editing.oldColor,
      },
      {
        size: editing.size,
        fit: editing.fit,
        color: editing.color,
        image: nextImage,
        ...(opts
          ? {
              price: opts.price,
              priceOversize: opts.priceOversize ?? null,
              maxQuantity: effectiveMaxCartQuantityForLine(
                {
                  trackStock: opts.trackStock,
                  stockQuantity: opts.stockQuantity,
                  variantStock: opts.variantStock ?? {},
                },
                {
                  fit: editing.fit,
                  size: editing.size,
                  color: editing.color,
                }
              ),
            }
          : {}),
      }
    );
    setEditing(null);
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
          Your cart is empty
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Add something you like from the shop.
        </p>
        <Link
          href="/women"
          className="mt-6 inline-flex rounded-md bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-[var(--background)] hover:bg-[var(--accent)]"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
        Shopping cart
      </h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {items.length} {items.length === 1 ? "item" : "items"}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <ul className="space-y-6 lg:col-span-2">
          {items.map((item) => (
            <li
              key={lineKey(item)}
              className="flex gap-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-[var(--muted-bg)]">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  unoptimized={item.image.includes("/storage/v1/object/public/")}
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/product/${item.productId}`}
                  className="font-display font-medium text-[var(--foreground)] hover:text-[var(--accent)]"
                >
                  {item.name}
                </Link>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
                  {item.color ? (
                    <p>
                      Color: <span className="text-[var(--foreground)]">{item.color}</span>
                    </p>
                  ) : null}
                  <p>
                    Size: <span className="text-[var(--foreground)]">{item.size}</span>
                  </p>
                  {item.fit ? (
                    <p>
                      Fit: <span className="text-[var(--foreground)]">{item.fit}</span>
                    </p>
                  ) : null}
                  <p>
                    Unit price:{" "}
                    <span className="text-[var(--foreground)]">
                      Rs. {cartLineUnitPrice(item).toFixed(2)}
                    </span>
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center rounded border border-[var(--border)]">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.size, item.quantity - 1, item.fit, item.color)
                      }
                      className="flex h-8 w-8 items-center justify-center text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                      aria-label="Decrease"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.size, item.quantity + 1, item.fit, item.color)
                      }
                      className="flex h-8 w-8 items-center justify-center text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                      aria-label="Increase"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="text-sm text-[var(--muted)] underline hover:text-[var(--foreground)]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const ok = window.confirm("Remove this item from your cart?");
                      if (!ok) return;
                      removeItem(item.productId, item.size, item.fit, item.color);
                    }}
                    className="text-sm text-[var(--muted)] underline hover:text-[var(--foreground)]"
                  >
                    Remove
                  </button>
                </div>
                {editing?.key === lineKey(item) && (
                  <div className="mt-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm">
                    {loadingOptions && !optionsByProduct[item.productId] ? (
                      <p className="text-[var(--muted)]">Loading options...</p>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-3">
                        <select
                          value={editing.size}
                          onChange={(e) => setEditing((s) => (s ? { ...s, size: e.target.value } : s))}
                          className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1.5"
                        >
                          {(optionsByProduct[item.productId]?.sizes ?? [item.size]).map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        {(optionsByProduct[item.productId]?.fits?.length ?? 0) > 0 ? (
                          <select
                            value={editing.fit ?? ""}
                            onChange={(e) =>
                              setEditing((s) =>
                                s ? { ...s, fit: (e.target.value || undefined) as ProductFit | undefined } : s
                              )
                            }
                            className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1.5"
                          >
                            {(optionsByProduct[item.productId]?.fits ?? []).map((fit) => (
                              <option key={fit} value={fit}>
                                {fit}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="rounded-md border border-[var(--border)] bg-[var(--muted-bg)] px-2 py-1.5 text-[var(--muted)]">
                            No fit options
                          </div>
                        )}
                        {(optionsByProduct[item.productId]?.colors?.length ?? 0) > 0 ? (
                          <select
                            value={editing.color ?? ""}
                            onChange={(e) =>
                              setEditing((s) => (s ? { ...s, color: e.target.value || undefined } : s))
                            }
                            className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1.5"
                          >
                            {(optionsByProduct[item.productId]?.colors ?? []).map((color) => (
                              <option key={color} value={color}>
                                {color}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="rounded-md border border-[var(--border)] bg-[var(--muted-bg)] px-2 py-1.5 text-[var(--muted)]">
                            No color options
                          </div>
                        )}
                      </div>
                    )}
                    <div className="mt-2 flex gap-3">
                      <button
                        type="button"
                        onClick={() => saveEdit(item)}
                        className="rounded-md bg-[var(--foreground)] px-3 py-1.5 text-xs font-semibold text-[var(--background)]"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(null)}
                        className="text-xs text-[var(--muted)] underline hover:text-[var(--foreground)]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-right font-medium text-[var(--foreground)]">
                <p className="text-xs text-[var(--muted)]">Line total</p>
                Rs. {(cartLineUnitPrice(item) * item.quantity).toFixed(2)}
              </div>
            </li>
          ))}
        </ul>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
            <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
              Order summary
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--muted)]">Subtotal</dt>
                <dd className="font-medium">Rs. {subtotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--muted)]">Shipping</dt>
                <dd className="font-medium">
                  {shipping === 0 ? (
                    <span className="text-[var(--accent)]">Free</span>
                  ) : (
                    `Rs. ${shipping.toFixed(2)}`
                  )}
                </dd>
              </div>
            </dl>
            {subtotal < CURRENCY.freeShippingThreshold && (
              <p className="mt-2 text-xs text-[var(--muted)]">
                Add Rs. {(CURRENCY.freeShippingThreshold - subtotal).toFixed(2)} more for free shipping
              </p>
            )}
            <div className="mt-4 flex justify-between border-t border-[var(--border)] pt-4 text-base font-semibold">
              <dt>Total</dt>
              <dd>Rs. {total.toFixed(2)}</dd>
            </div>
            <p className="mt-3 text-xs text-[var(--muted)]">
              {isSignedIn
                ? "You’re signed in — continue to checkout to place your order."
                : "You must be signed in to place an order. You&apos;ll be asked to sign in at checkout if needed."}
            </p>
            <Link
              href="/checkout"
              className="mt-6 flex w-full items-center justify-center rounded-md bg-[var(--foreground)] px-4 py-3 text-sm font-semibold text-[var(--background)] hover:bg-[var(--accent)]"
            >
              Proceed to checkout
            </Link>
            {!isSignedIn && (
              <Link
                href="/login?redirect=/checkout"
                className="mt-2 block text-center text-sm text-[var(--accent)] hover:underline"
              >
                Sign in first
              </Link>
            )}
            <Link
              href="/women"
              className="mt-3 block text-center text-sm text-[var(--accent)] hover:underline"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
