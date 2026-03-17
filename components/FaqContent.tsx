"use client";

import { useState } from "react";

export default function FaqContent({
  initialFaqs
}: {
  initialFaqs: { q: string; a: string }[]
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <dl className="mt-10 space-y-4">
      {initialFaqs.map((faq, i) => (
        <div
          key={i}
          className="rounded-lg border border-[var(--border)] bg-[var(--card)]"
        >
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between px-4 py-4 text-left text-sm font-medium text-[var(--foreground)]"
          >
            {faq.q}
            <span className="text-[var(--muted)]">
              {open === i ? "−" : "+"}
            </span>
          </button>
          {open === i && (
            <div className="border-t border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)]">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </dl>
  );
}
