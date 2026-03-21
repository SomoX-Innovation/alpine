"use client";

import { useState } from "react";
import { getOrderByNumberAndEmail } from "@/app/actions/orders";
import type { OrderLookupResult } from "@/app/actions/orders";
import OrderLineItemsList from "@/components/OrderLineItemsList";

export default function TrackOrderForm() {
  const [result, setResult] = useState<OrderLookupResult | "loading" | null>(null);

  return (
    <form
      className="mt-8 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const orderNumber = (form.querySelector('[name="orderNumber"]') as HTMLInputElement).value;
        const email = (form.querySelector('[name="email"]') as HTMLInputElement).value;
        setResult("loading");
        const data = await getOrderByNumberAndEmail(orderNumber, email);
        setResult(data);
      }}
    >
      {result === "loading" ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--muted-bg)] p-4 text-sm text-[var(--muted)]">
          Looking up order…
        </div>
      ) : result === null ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--muted-bg)] p-4 text-sm text-[var(--foreground)]">
          <p className="font-medium">Order not found</p>
          <p className="mt-2 text-[var(--muted)]">
            No order matches that order number and email. Check the details and try again.
          </p>
        </div>
      ) : result ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-sm text-[var(--foreground)]">
          <p className="font-medium">Order {result.order_number}</p>
          <p className="mt-2 text-[var(--muted)]">
            Status: <span className="font-medium capitalize text-[var(--foreground)]">{result.status}</span>
          </p>
          <p className="mt-1 text-[var(--muted)]">
            Placed: {new Date(result.created_at).toLocaleDateString()}
          </p>
          <p className="mt-1 text-[var(--muted)]">
            Total: Rs. {Number(result.total).toFixed(2)}
          </p>
          {(result.tracking_code || result.tracking_carrier) && (
            <p className="mt-3 font-medium text-[var(--foreground)]">
              Tracking: {result.tracking_carrier ? `${result.tracking_carrier} — ` : ""}
              {result.tracking_code ?? "—"}
            </p>
          )}
          {result.line_items && result.line_items.length > 0 && (
            <div className="mt-4 border-t border-[var(--border)] pt-4">
              <p className="text-sm font-semibold text-[var(--foreground)]">Items</p>
              <OrderLineItemsList items={result.line_items} variant="compact" />
            </div>
          )}
        </div>
      ) : null}

      {result !== "loading" && (
        <>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Order number
            </label>
            <input
              name="orderNumber"
              type="text"
              required
              placeholder="e.g. ALP-1001"
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-[var(--foreground)] py-3 text-sm font-semibold text-[var(--background)] hover:bg-[var(--accent)]"
          >
            Track order
          </button>
        </>
      )}
    </form>
  );
}
