"use client";

import Image from "next/image";
import type { OrderLineItem } from "@/app/actions/orders";

function imageUnoptimized(src: string) {
  return src.includes("/storage/v1/object/public/");
}

type Props = {
  items: OrderLineItem[];
  /** Larger cards on order detail; smaller on track-order / tight layouts */
  variant?: "default" | "compact";
};

export default function OrderLineItemsList({ items, variant = "default" }: Props) {
  const isCompact = variant === "compact";
  const imgBox = isCompact
    ? "relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-[var(--muted-bg)] ring-1 ring-[var(--border)]"
    : "relative h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-[var(--muted-bg)] ring-1 ring-[var(--border)] sm:h-32 sm:w-28";

  if (!items.length) {
    return <p className="text-sm text-[var(--muted)]">No items on this order.</p>;
  }

  return (
    <ul className={isCompact ? "mt-3 space-y-2" : "mt-4 space-y-3"}>
      {items.map((item, i) => {
        const unit = Number(item.price) || 0;
        const qty = Math.max(0, Math.floor(Number(item.quantity)) || 0);
        const lineTotal = unit * qty;
        return (
          <li
            key={`${item.productId}-${item.size}-${item.fit ?? ""}-${i}`}
            className={
              isCompact
                ? "flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-2.5"
                : "flex gap-4 rounded-xl border border-[var(--border)] bg-[var(--muted-bg)]/35 p-4 shadow-sm"
            }
          >
            <div className={imgBox}>
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes={isCompact ? "56px" : "(max-width: 640px) 96px, 112px"}
                  unoptimized={imageUnoptimized(item.image)}
                  className="object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center bg-[var(--muted-bg)] text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]"
                  aria-hidden
                >
                  —
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={
                  isCompact
                    ? "font-semibold leading-snug text-[var(--foreground)]"
                    : "text-base font-semibold leading-snug text-[var(--foreground)] sm:text-lg"
                }
              >
                {item.name}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Size {item.size}
                {item.fit ? ` · ${item.fit}` : ""}
                <span className="text-[var(--foreground)]"> · Qty {qty}</span>
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
                Rs. {unit.toFixed(2)} <span className="text-[var(--muted)]">each</span>
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p
                className={
                  isCompact ? "text-sm font-semibold text-[var(--foreground)]" : "text-base font-bold text-[var(--foreground)]"
                }
              >
                Rs. {lineTotal.toFixed(2)}
              </p>
              <p className="text-xs text-[var(--muted)]">line total</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
