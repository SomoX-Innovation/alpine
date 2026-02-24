"use client";

import { useState } from "react";

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  return (
    <form
      className="mt-8 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      {sent ? (
        <p className="rounded-md bg-[var(--muted-bg)] p-4 text-sm text-[var(--foreground)]">
          Thanks for your message. We&apos;ll get back to you soon.
        </p>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Name
            </label>
            <input
              type="text"
              required
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Email
            </label>
            <input
              type="email"
              required
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Message
            </label>
            <textarea
              required
              rows={5}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-[var(--foreground)] py-3 text-sm font-semibold text-[var(--background)] hover:bg-[var(--accent)]"
          >
            Send message
          </button>
        </>
      )}
    </form>
  );
}
