"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderLineItem } from "@/app/actions/orders";
import { updateOrderLineItemsAdmin } from "@/app/actions/orders";

export default function OrderItemsEditor({
  orderId,
  initialItems,
}: {
  orderId: string;
  initialItems: OrderLineItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<OrderLineItem[]>(initialItems);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, i) =>
          sum + (Number(i.price) || 0) * Math.max(0, Math.floor(Number(i.quantity) || 0)),
        0
      ),
    [items]
  );

  function updateField<K extends keyof OrderLineItem>(index: number, key: K, value: OrderLineItem[K]) {
    setItems((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  }

  function removeRow(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addRow() {
    setItems((prev) => [
      ...prev,
      {
        productId: "",
        name: "",
        size: "M",
        quantity: 1,
        price: 0,
      },
    ]);
  }

  async function save() {
    setError(null);
    setSuccess(false);
    setSaving(true);
    const result = await updateOrderLineItemsAdmin(orderId, items);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    router.refresh();
    window.setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Items</h2>
        <button
          type="button"
          onClick={addRow}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
        >
          + Add item row
        </button>
      </div>
      {error && (
        <p className="mt-2 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>
      )}
      {success && (
        <p className="mt-2 rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
          Items updated.
        </p>
      )}
      <div className="mt-3 space-y-3">
        {items.map((item, i) => (
          <div key={`${item.productId}-${i}`} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={item.name}
                onChange={(e) => updateField(i, "name", e.target.value)}
                placeholder="Item name"
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
              <input
                value={item.productId}
                onChange={(e) => updateField(i, "productId", e.target.value)}
                placeholder="Product ID"
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
              <input
                value={item.color ?? ""}
                onChange={(e) => updateField(i, "color", e.target.value || undefined)}
                placeholder="Color"
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
              <select
                value={item.fit ?? ""}
                onChange={(e) => updateField(i, "fit", e.target.value || undefined)}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <option value="">No fit</option>
                <option value="Regular">Regular</option>
                <option value="Oversize">Oversize</option>
              </select>
              <input
                value={item.size}
                onChange={(e) => updateField(i, "size", e.target.value)}
                placeholder="Size"
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
              <input
                type="number"
                min={0}
                step={0.01}
                value={Number(item.price) || 0}
                onChange={(e) => updateField(i, "price", Number(e.target.value) || 0)}
                placeholder="Unit price"
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
              <input
                type="number"
                min={1}
                step={1}
                value={Math.max(1, Math.floor(Number(item.quantity) || 1))}
                onChange={(e) => updateField(i, "quantity", Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                placeholder="Qty"
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
              <input
                value={item.image ?? ""}
                onChange={(e) => updateField(i, "image", e.target.value || undefined)}
                placeholder="Image URL (optional)"
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-[var(--muted)]">
                Line total: Rs. {((Number(item.price) || 0) * Math.max(0, Math.floor(Number(item.quantity) || 0))).toFixed(2)}
              </p>
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="text-xs text-red-500 hover:underline"
              >
                Remove row
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
        <p className="text-sm text-[var(--muted)]">Subtotal preview</p>
        <p className="text-sm font-semibold text-[var(--foreground)]">Rs. {subtotal.toFixed(2)}</p>
      </div>
      <button
        type="button"
        onClick={save}
        disabled={saving || items.length === 0}
        className="mt-3 rounded-md bg-[var(--foreground)] px-4 py-2.5 text-sm font-medium text-[var(--background)] hover:bg-[var(--accent)] disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save item changes"}
      </button>
    </section>
  );
}
