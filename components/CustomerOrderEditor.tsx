"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderLineItem } from "@/app/actions/orders";
import { updateMyOrderItems } from "@/app/actions/orders";

type Props = {
  orderId: string;
  initialItems: OrderLineItem[];
  editable: boolean;
};

export default function CustomerOrderEditor({ orderId, initialItems, editable }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<OrderLineItem[]>(initialItems);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + (Number(i.price) || 0) * (Math.max(0, Math.floor(Number(i.quantity) || 0))), 0),
    [items]
  );

  function updateQty(index: number, qty: number) {
    setItems((prev) =>
      prev.map((line, i) =>
        i === index ? { ...line, quantity: Math.max(1, Math.floor(Number(qty) || 1)) } : line
      )
    );
  }

  function removeLine(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function save() {
    setMessage(null);
    setPending(true);
    const result = await updateMyOrderItems(orderId, items);
    setPending(false);
    if (result.error) {
      setMessage(result.error);
      return;
    }
    setMessage("Order updated.");
    router.refresh();
  }

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold uppercase tracking-wide text-[var(--foreground)]">
          Items
        </h2>
        {editable ? <span className="text-xs text-[var(--muted)]">Pending orders can be edited</span> : null}
      </div>
      <ul className="mt-3 space-y-3">
        {items.map((item, i) => (
          <li key={`${item.productId}-${item.size}-${item.fit ?? ""}-${item.color ?? ""}-${i}`} className="rounded-lg border border-[var(--border)] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-[var(--foreground)]">{item.name}</p>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Rs. {((Number(item.price) || 0) * Math.max(0, Math.floor(Number(item.quantity) || 0))).toFixed(2)}
              </p>
            </div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {item.color ? `Color: ${item.color} · ` : ""}Size: {item.size}
              {item.fit ? ` · Fit: ${item.fit}` : ""}
            </p>
            {editable && (
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQty(i, (Number(item.quantity) || 1) - 1)}
                  className="h-8 w-8 rounded border border-[var(--border)] text-[var(--foreground)]"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  value={Math.max(1, Math.floor(Number(item.quantity) || 1))}
                  onChange={(e) => updateQty(i, Number(e.target.value))}
                  className="w-16 rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() => updateQty(i, (Number(item.quantity) || 1) + 1)}
                  className="h-8 w-8 rounded border border-[var(--border)] text-[var(--foreground)]"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => removeLine(i)}
                  className="ml-2 text-xs text-red-500 hover:underline"
                >
                  Remove item
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
        <p className="text-sm text-[var(--muted)]">Updated subtotal</p>
        <p className="font-semibold text-[var(--foreground)]">Rs. {subtotal.toFixed(2)}</p>
      </div>
      {message && <p className="mt-2 text-sm text-[var(--muted)]">{message}</p>}
      {editable && (
        <button
          type="button"
          disabled={pending || items.length === 0}
          onClick={save}
          className="mt-3 rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-[var(--background)] hover:bg-[var(--accent)] disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save order changes"}
        </button>
      )}
      {!editable && (
        <p className="mt-3 text-xs text-[var(--muted)]">
          This order can no longer be changed because it is already being processed.
        </p>
      )}
    </section>
  );
}
