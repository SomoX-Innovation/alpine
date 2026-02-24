"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrder } from "@/app/actions/orders";
import type { OrderDetail } from "@/app/actions/orders";

const STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"] as const;

export default function OrderDetailForm({ order }: { order: OrderDetail }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [trackingCode, setTrackingCode] = useState(order.tracking_code ?? "");
  const [trackingCarrier, setTrackingCarrier] = useState(order.tracking_carrier ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const result = await updateOrder(order.id, {
      status,
      tracking_code: trackingCode.trim() || undefined,
      tracking_carrier: trackingCarrier.trim() || undefined,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
      <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
        Update order
      </h2>
      {error && (
        <p className="mt-2 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {error}
        </p>
      )}
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Tracking code
          </label>
          <input
            type="text"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            placeholder="e.g. 1Z999..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Carrier
          </label>
          <input
            type="text"
            value={trackingCarrier}
            onChange={(e) => setTrackingCarrier(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            placeholder="e.g. DHL, UPS"
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
