"use client";

import { useState } from "react";

const faqs: { q: string; a: string }[] = [
  {
    q: "What is your return policy?",
    a: "You can return unworn, unwashed items with tags attached within 30 days of delivery. We'll refund the purchase price to your original payment method. Sale items may have different terms.",
  },
  {
    q: "How long does shipping take?",
    a: "Standard delivery is 3–5 business days within the EU. Express options are available at checkout. You'll receive tracking once your order ships.",
  },
  {
    q: "Do you ship internationally?",
    a: "We currently ship to addresses in the European Union. We're working on expanding to more countries.",
  },
  {
    q: "How do I know my size?",
    a: "Check our Size guide (link in footer) for measurements. If you're between sizes, we recommend sizing up for a relaxed fit or down for a tailored look.",
  },
  {
    q: "How can I track my order?",
    a: "After your order ships, you'll get an email with a tracking link. You can also log into your account and view order history.",
  },
];

export default function FaqContent() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <dl className="mt-10 space-y-4">
      {faqs.map((faq, i) => (
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
