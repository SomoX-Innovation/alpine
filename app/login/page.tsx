"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/app/actions/auth";
import PasswordInput from "@/components/PasswordInput";
import { safeRedirectPath } from "@/lib/safe-redirect";
import ResendConfirmationEmail from "@/components/ResendConfirmationEmail";

function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const reset = searchParams.get("reset");
  const authError = searchParams.get("error");
  const redirectAfter = safeRedirectPath(searchParams.get("redirect"));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push(redirectAfter);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--card)] p-8">
        <h1 className="font-display text-xl font-semibold text-[var(--foreground)]">
          Sign in
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Access your account and order history.
        </p>

        {reset === "1" && (
          <p className="mt-4 rounded-md bg-[var(--muted-bg)] px-3 py-2 text-sm text-[var(--foreground)]">
            Your password has been updated. Please sign in.
          </p>
        )}

        {authError && (
          <p className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {decodeURIComponent(authError.replace(/\+/g, " "))}
          </p>
        )}

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
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-[var(--foreground)] py-2.5 text-sm font-semibold text-[var(--background)] transition-colors hover:bg-[var(--accent)]"
          >
            Sign in
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <Link href="/forgot-password" className="text-[var(--accent)] hover:underline">
            Forgot password?
          </Link>
        </div>

        <div className="mt-3 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[var(--accent)] hover:underline">
            Register
          </Link>
        </div>

        <div className="mt-8 border-t border-[var(--border)] pt-6">
          <p className="text-sm font-medium text-[var(--foreground)]">{`Didn't receive the confirmation email?`}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Enter the email you used to register, then resend the link.
          </p>
          <label htmlFor="resend-email" className="mt-3 block text-sm font-medium text-[var(--foreground)]">
            Email
          </label>
          <input
            id="resend-email"
            type="email"
            autoComplete="email"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
          <div className="mt-3">
            <ResendConfirmationEmail email={resendEmail.trim()} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

