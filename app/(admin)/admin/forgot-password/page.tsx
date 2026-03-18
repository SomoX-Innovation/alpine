"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "../actions/auth";

export default function AdminForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await sendPasswordResetEmail(formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setSent(true);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--card)] p-8">
        <h1 className="font-display text-xl font-semibold text-[var(--foreground)]">
          Reset password (Admin)
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Enter your admin email to receive a reset link.
        </p>

        {sent ? (
          <div className="mt-6 space-y-3">
            <p className="rounded-md bg-[var(--muted-bg)] px-3 py-2 text-sm text-[var(--foreground)]">
              If an account exists for that email, we sent a reset email.
            </p>
            <Link
              href="/admin/login"
              className="mt-2 inline-flex w-full justify-center rounded-md border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
            >
              Back to admin login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
                {error}
              </p>
            )}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[var(--foreground)]"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                placeholder="admin@example.com"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-[var(--foreground)] py-2.5 text-sm font-semibold text-[var(--background)] transition-colors hover:bg-[var(--accent)]"
            >
              Send reset email
            </button>

            <div className="text-center text-sm">
              <Link
                href="/admin/login"
                className="text-[var(--accent)] hover:underline"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

