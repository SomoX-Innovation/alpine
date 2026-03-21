"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { updatePassword } from "@/app/actions/auth";
import PasswordInput from "@/components/PasswordInput";
import { safeRedirectPath } from "@/lib/safe-redirect";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  /** After setting password, send user here (store login or admin login) */
  const afterLogin = safeRedirectPath(searchParams.get("redirect"), "/login");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await updatePassword(formData);
    setPending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    const sep = afterLogin.includes("?") ? "&" : "?";
    router.push(`${afterLogin}${sep}reset=1`);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--card)] p-8">
        <h1 className="font-display text-xl font-semibold text-[var(--foreground)]">
          Set new password
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Choose a new password for your account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
              {error}
            </p>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[var(--foreground)]"
            >
              New password
            </label>
            <PasswordInput
              id="password"
              name="password"
              required
              minLength={6}
              autoComplete="new-password"
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
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-[var(--foreground)] py-2.5 text-sm font-semibold text-[var(--background)] transition-colors hover:bg-[var(--accent)] disabled:opacity-60"
          >
            {pending ? "Saving…" : "Update password"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          <Link href="/login" className="text-[var(--accent)] hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-[var(--muted)]">
          Loading…
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
