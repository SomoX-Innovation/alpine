"use client";

import type { DtfItem } from "@/lib/settings-db";
import { useState } from "react";
import { DtfGenderSelect } from "@/components/DtfGenderSelect";

type Props = {
  items: DtfItem[];
};

export function DtfGrid({ items }: Props) {
  const [visible, setVisible] = useState<DtfItem[]>(items);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
          DTF designs
        </h2>
        <DtfGenderSelect items={items} onFilteredChange={setVisible} />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((item, i) => (
          <div
            key={`${item.code}-${i}`}
            className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm"
          >
            <div className="bg-[var(--muted-bg)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.code || "DTF design"}
                className="h-auto w-full object-contain"
              />
            </div>
            <div className="border-t border-[var(--border)] px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-[var(--foreground)]">
                  {item.code || "DTF code"}
                </p>
                <span className="whitespace-nowrap rounded-full bg-[var(--muted-bg)] px-2 py-0.5 text-xs font-medium text-[var(--muted)]">
                  {item.genders.join(" / ")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

