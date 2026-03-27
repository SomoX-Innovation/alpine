"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrder } from "@/app/actions/orders";
import type { OrderDetail } from "@/app/actions/orders";
import { getStatusDisplay } from "@/lib/order-status";

const STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"] as const;

export default function OrderDetailForm({ order }: { order: OrderDetail }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [trackingCode, setTrackingCode] = useState(order.tracking_code ?? "");
  const [trackingCarrier, setTrackingCarrier] = useState(order.tracking_carrier ?? "");
  const [customerName, setCustomerName] = useState(order.customer_name ?? "");
  const [customerEmail, setCustomerEmail] = useState(order.customer_email ?? "");
  const [address, setAddress] = useState(order.shipping_address?.address ?? "");
  const [city, setCity] = useState(order.shipping_address?.city ?? "");
  const [postalCode, setPostalCode] = useState(order.shipping_address?.postalCode ?? "");
  const [country, setCountry] = useState(order.shipping_address?.country ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);
    const result = await updateOrder(order.id, {
      status,
      tracking_code: trackingCode.trim() || undefined,
      tracking_carrier: trackingCarrier.trim() || undefined,
      customer_name: customerName.trim(),
      customer_email: customerEmail.trim(),
      shipping_address: {
        address: address.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
      },
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    router.refresh();
    window.setTimeout(() => setSuccess(false), 4000);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm"
    >
      <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
        Order details
      </h2>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Updates sync to the customer’s account order view when they refresh.
      </p>
      {error && (
        <p className="mt-3 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>
      )}
      {success && (
        <p className="mt-3 rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
          Order saved successfully.
        </p>
      )}
      <div className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]" htmlFor="customer-name">
              Customer name
            </label>
            <input
              id="customer-name"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              autoComplete="name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]" htmlFor="customer-email">
              Customer email
            </label>
            <input
              id="customer-email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              autoComplete="email"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]" htmlFor="ship-address">
            Shipping address
          </label>
          <input
            id="ship-address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            autoComplete="street-address"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]" htmlFor="ship-city">
              City
            </label>
            <input
              id="ship-city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              autoComplete="address-level2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]" htmlFor="ship-postal">
              Postal code
            </label>
            <input
              id="ship-postal"
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              autoComplete="postal-code"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]" htmlFor="ship-country">
              Country
            </label>
            <input
              id="ship-country"
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              autoComplete="country-name"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]" htmlFor="order-status">
            Status
          </label>
          <select
            id="order-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {getStatusDisplay(s).label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]" htmlFor="tracking-code">
            Tracking code
          </label>
          <input
            id="tracking-code"
            type="text"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            placeholder="e.g. 1Z999…"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]" htmlFor="tracking-carrier">
            Carrier
          </label>
          <input
            id="tracking-carrier"
            type="text"
            value={trackingCarrier}
            onChange={(e) => setTrackingCarrier(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            placeholder="e.g. DHL, UPS"
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-md bg-[var(--foreground)] py-2.5 text-sm font-medium text-[var(--background)] hover:bg-[var(--accent)] disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
