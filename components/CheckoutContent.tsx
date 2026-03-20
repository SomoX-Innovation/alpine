"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/app/actions/orders";
import { CURRENCY } from "@/lib/currency";

export default function CheckoutContent() {
  const { items, clearCart } = useCart();
  const [step, setStep] = useState<"shipping" | "payment" | "confirmation">("shipping");
  const [placed, setPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shippingData, setShippingData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= CURRENCY.freeShippingThreshold ? 0 : CURRENCY.shippingCost;
  const total = subtotal + shipping;

  if (items.length === 0 && !placed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
          Your cart is empty
        </h1>
        <Link
          href="/cart"
          className="mt-4 inline-block text-[var(--accent)] hover:underline"
        >
          Return to cart
        </Link>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-full bg-[var(--muted-bg)] p-4 inline-block mb-6">
          <svg
            className="h-12 w-12 text-[var(--accent)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
          Thank you for your order
        </h1>
        {orderNumber && (
          <p className="mt-2 font-medium text-[var(--foreground)]">
            Order number: <span className="font-mono">{orderNumber}</span>
          </p>
        )}
        <p className="mt-2 text-[var(--muted)]">
          We&apos;ve sent a confirmation email. You&apos;ll get a shipping update soon. You can track your order with the order number above.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-md bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-[var(--background)] hover:bg-[var(--accent)]"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/cart"
        className="text-sm text-[var(--accent)] hover:underline"
      >
        ← Back to cart
      </Link>
      <h1 className="font-display mt-4 text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
        Checkout
      </h1>

      {/* Steps */}
      <div className="mt-6 flex gap-4 border-b border-[var(--border)]">
        <button
          type="button"
          onClick={() => setStep("shipping")}
          className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
            step === "shipping"
              ? "border-[var(--foreground)] text-[var(--foreground)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Shipping
        </button>
        <button
          type="button"
          onClick={() => setStep("payment")}
          className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
            step === "payment"
              ? "border-[var(--foreground)] text-[var(--foreground)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Payment
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          {step === "shipping" && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                setShippingData({
                  email: (form.querySelector('[name="email"]') as HTMLInputElement).value,
                  firstName: (form.querySelector('[name="firstName"]') as HTMLInputElement).value,
                  lastName: (form.querySelector('[name="lastName"]') as HTMLInputElement).value,
                  address: (form.querySelector('[name="address"]') as HTMLInputElement).value,
                  city: (form.querySelector('[name="city"]') as HTMLInputElement).value,
                  postalCode: (form.querySelector('[name="postalCode"]') as HTMLInputElement).value,
                  country: (form.querySelector('[name="country"]') as HTMLSelectElement).value,
                });
                setStep("payment");
              }}
            >
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  placeholder="you@example.com"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    First name
                  </label>
                  <input
                    name="firstName"
                    type="text"
                    required
                    className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    Last name
                  </label>
                  <input
                    name="lastName"
                    type="text"
                    required
                    className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]">
                  Address
                </label>
                <input
                  name="address"
                  type="text"
                  required
                  className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  placeholder="Street address"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    City
                  </label>
                  <input
                    name="city"
                    type="text"
                    required
                    className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    Postal code
                  </label>
                  <input
                    name="postalCode"
                    type="text"
                    required
                    className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]">
                  Country
                </label>
                <select
                  name="country"
                  required
                  className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                >
                  <option value="">Select country</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="IT">Italy</option>
                  <option value="ES">Spain</option>
                  <option value="NL">Netherlands</option>
                  <option value="BE">Belgium</option>
                  <option value="AT">Austria</option>
                  <option value="PL">Poland</option>
                  <option value="GB">United Kingdom</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-[var(--foreground)] py-3 text-sm font-semibold text-[var(--background)] hover:bg-[var(--accent)]"
              >
                Continue to payment
              </button>
            </form>
          )}

          {step === "payment" && (
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                const result = await createOrder({
                  customer_email: shippingData.email,
                  customer_name: `${shippingData.firstName} ${shippingData.lastName}`.trim(),
                  shipping_address: {
                    address: shippingData.address,
                    city: shippingData.city,
                    postalCode: shippingData.postalCode,
                    country: shippingData.country,
                  },
                  line_items: items.map((i) => ({
                    productId: i.productId,
                    name: i.name,
                    size: i.size,
                    quantity: i.quantity,
                    price: i.price,
                  })),
                  subtotal,
                  shipping_cost: shipping,
                  total,
                });
                if (result.error) {
                  setError(result.error);
                  return;
                }
                if (result.order_number) setOrderNumber(result.order_number);
                clearCart();
                setPlaced(true);
              }}
            >
              {error && (
                <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>
              )}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]">
                  Card number
                </label>
                <input
                  type="text"
                  required
                  placeholder="4242 4242 4242 4242"
                  className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    Expiry
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    CVC
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-[var(--foreground)] py-3 text-sm font-semibold text-[var(--background)] hover:bg-[var(--accent)]"
              >
                Place order · Rs. {total.toFixed(2)}
              </button>
            </form>
          )}
        </div>

        <div>
          <div className="sticky top-24 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
            <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
              Order summary
            </h2>
            <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.size}`}
                  className="flex gap-3"
                >
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded bg-[var(--muted-bg)]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      unoptimized={item.image.includes("/storage/v1/object/public/")}
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {item.name}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {item.size} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    Rs. {(item.price * item.quantity).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-[var(--border)] pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--muted)]">Subtotal</dt>
                <dd>Rs. {subtotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--muted)]">Shipping</dt>
                <dd>{shipping === 0 ? "Free" : `Rs. ${shipping.toFixed(2)}`}</dd>
              </div>
            </dl>
            <div className="mt-2 flex justify-between font-semibold">
              <dt>Total</dt>
              <dd>Rs. {total.toFixed(2)}</dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
