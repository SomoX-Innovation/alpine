"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { CURRENCY } from "@/lib/currency";

export default function CartContent() {
  const { items, removeItem, updateQuantity } = useCart();
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= CURRENCY.freeShippingThreshold ? 0 : CURRENCY.shippingCost;
  const total = subtotal + shipping;

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
              key={`${item.productId}-${item.size}`}
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
                <p className="mt-0.5 text-sm text-[var(--muted)]">
                  Size: {item.size} · Rs. {item.price}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center rounded border border-[var(--border)]">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.size, item.quantity - 1)
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
                        updateQuantity(item.productId, item.size, item.quantity + 1)
                      }
                      className="flex h-8 w-8 items-center justify-center text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                      aria-label="Increase"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId, item.size)}
                    className="text-sm text-[var(--muted)] underline hover:text-[var(--foreground)]"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-right font-medium text-[var(--foreground)]">
                Rs. {(item.price * item.quantity).toFixed(2)}
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
            <Link
              href="/checkout"
              className="mt-6 flex w-full items-center justify-center rounded-md bg-[var(--foreground)] px-4 py-3 text-sm font-semibold text-[var(--background)] hover:bg-[var(--accent)]"
            >
              Proceed to checkout
            </Link>
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
