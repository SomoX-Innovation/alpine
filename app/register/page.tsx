"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/app/actions/auth";
import PasswordInput from "@/components/PasswordInput";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await register(formData);
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
          Create account
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Register to manage your orders.
        </p>

        {sent ? (
          <div className="mt-6 space-y-3">
            <p className="rounded-md bg-[var(--muted-bg)] px-3 py-2 text-sm text-[var(--foreground)]">
              If confirmation is required, check your email for the verification link.
            </p>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full rounded-md bg-[var(--foreground)] py-2.5 text-sm font-semibold text-[var(--background)] transition-colors hover:bg-[var(--accent)]"
            >
              Go to sign in
            </button>
            <div className="text-center text-sm">
              <Link href="/" className="text-[var(--accent)] hover:underline">
                Back to home
              </Link>
            </div>
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
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[var(--foreground)]"
              >
                Password
              </label>
              <PasswordInput
                id="password"
                name="password"
                required
                autoComplete="new-password"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label
                htmlFor="confirm_password"
                className="block text-sm font-medium text-[var(--foreground)]"
              >
                Confirm password
              </label>
              <PasswordInput
                id="confirm_password"
                name="confirm_password"
                required
                autoComplete="new-password"
                placeholder="Re-enter password"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-[var(--foreground)] py-2.5 text-sm font-semibold text-[var(--background)] transition-colors hover:bg-[var(--accent)]"
            >
              Create account
            </button>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-[var(--accent)] hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

