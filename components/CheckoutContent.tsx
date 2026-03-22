"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/app/actions/orders";
import { CURRENCY, SHIPPING_COUNTRY } from "@/lib/currency";
import type { CustomerProfile } from "@/app/actions/account";

type CheckoutContentProps = {
  userEmail: string;
  savedProfile: CustomerProfile | null;
};

export default function CheckoutContent({ userEmail, savedProfile }: CheckoutContentProps) {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [step, setStep] = useState<"shipping" | "payment" | "confirmation">("shipping");
  const [error, setError] = useState<string | null>(null);
  const [shippingData, setShippingData] = useState(() => ({
    firstName: savedProfile?.first_name?.trim() || "",
    lastName: savedProfile?.last_name?.trim() || "",
    address: savedProfile?.address_line?.trim() || "",
    city: savedProfile?.city?.trim() || "",
    postalCode: savedProfile?.postal_code?.trim() || "",
    country: savedProfile?.country?.trim() || SHIPPING_COUNTRY,
  }));
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= CURRENCY.freeShippingThreshold ? 0 : CURRENCY.shippingCost;
  const total = subtotal + shipping;

  if (items.length === 0) {
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
      <p className="mt-2 text-sm text-[var(--muted)]">
        Signed in as <span className="font-medium text-[var(--foreground)]">{userEmail}</span>
      </p>

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
                  firstName: (form.querySelector('[name="firstName"]') as HTMLInputElement).value,
                  lastName: (form.querySelector('[name="lastName"]') as HTMLInputElement).value,
                  address: (form.querySelector('[name="address"]') as HTMLInputElement).value,
                  city: (form.querySelector('[name="city"]') as HTMLInputElement).value,
                  postalCode: (form.querySelector('[name="postalCode"]') as HTMLInputElement).value,
                  country: (form.querySelector('[name="country"]') as HTMLInputElement).value,
                });
                setStep("payment");
              }}
            >
              <div className="rounded-md border border-[var(--border)] bg-[var(--muted-bg)]/40 px-4 py-3 text-sm">
                <span className="text-[var(--muted)]">Order email (your account)</span>
                <p className="mt-1 font-medium text-[var(--foreground)]">{userEmail}</p>
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
                    defaultValue={shippingData.firstName}
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
                    defaultValue={shippingData.lastName}
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
                  defaultValue={shippingData.address}
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
                    defaultValue={shippingData.city}
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
                    defaultValue={shippingData.postalCode}
                    className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]">
                  Country
                </label>
                <input type="hidden" name="country" value={SHIPPING_COUNTRY} />
                <p className="mt-1 rounded-md border border-[var(--border)] bg-[var(--muted-bg)] px-4 py-2.5 text-sm text-[var(--foreground)]">
                  {SHIPPING_COUNTRY}
                  <span className="ml-2 text-[var(--muted)]">(we ship within Sri Lanka only)</span>
                </p>
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
                    image: i.image,
                    ...(i.fit ? { fit: i.fit } : {}),
                  })),
                  subtotal,
                  shipping_cost: shipping,
                  total,
                  payment_method: "cod",
                });
                if (result.error) {
                  setError(result.error);
                  return;
                }
                clearCart();
                if (result.order_id) {
                  router.push("/account?tab=orders&placed=1");
                  router.refresh();
                }
              }}
            >
              {error && (
                <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>
              )}
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium text-[var(--foreground)]">Payment method</legend>
                <div className="flex items-start gap-3 rounded-md border-2 border-[var(--foreground)] bg-[var(--card)] p-4">
                  <input type="radio" name="paymentMethod" checked readOnly className="mt-1" aria-checked="true" />
                  <span>
                    <span className="block font-medium text-[var(--foreground)]">Cash on delivery (COD)</span>
                    <span className="text-sm text-[var(--muted)]">
                      Pay with cash when your order is delivered.
                    </span>
                  </span>
                </div>
                <div
                  className="flex items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--muted-bg)]/50 p-4 opacity-75"
                  aria-disabled="true"
                >
                  <input type="radio" name="paymentMethodCard" disabled className="mt-1" />
                  <span className="flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-[var(--foreground)]">Card payment</span>
                      <span className="rounded-full bg-[var(--muted-bg)] px-2 py-0.5 text-xs font-medium text-[var(--muted)]">
                        Coming soon
                      </span>
                    </span>
                    <span className="mt-1 block text-sm text-[var(--muted)]">
                      Online card payments will be available here soon.
                    </span>
                  </span>
                </div>
              </fieldset>
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
                  key={`${item.productId}-${item.size}-${item.fit ?? ""}`}
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
                      {item.size}
                      {item.fit ? ` · ${item.fit}` : ""} × {item.quantity}
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
