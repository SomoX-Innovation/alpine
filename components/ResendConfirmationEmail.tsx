"use client";

import { useEffect, useState } from "react";
import { resendConfirmationEmail } from "@/app/actions/auth";

type Props = {
  email: string;
  /** Compact style for inline use */
  variant?: "default" | "inline";
};

const COOLDOWN_MS = 60_000;

export default function ResendConfirmationEmail({ email, variant = "default" }: Props) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [cooldownSec, setCooldownSec] = useState(0);

  useEffect(() => {
    if (cooldownSec <= 0) return;
    const id = window.setTimeout(() => setCooldownSec((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [cooldownSec]);

  async function handleResend() {
    if (!email.trim() || pending || cooldownSec > 0) return;
    setPending(true);
    setMessage(null);
    const fd = new FormData();
    fd.set("email", email.trim());
    const result = await resendConfirmationEmail(fd);
    setPending(false);
    if (result.error) {
      setMessage({ type: "err", text: result.error });
      return;
    }
    setMessage({ type: "ok", text: "Check your inbox — we sent another confirmation link." });
    setCooldownSec(Math.ceil(COOLDOWN_MS / 1000));
  }

  const btnClass =
    variant === "inline"
      ? "text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline disabled:opacity-50"
      : "w-full rounded-md border border-[var(--border)] bg-[var(--background)] py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted-bg)] disabled:opacity-50";

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleResend}
        disabled={pending || cooldownSec > 0 || !email.trim()}
        className={btnClass}
      >
        {pending
          ? "Sending…"
          : cooldownSec > 0
            ? `Resend in ${cooldownSec}s`
            : "Resend confirmation email"}
      </button>
      {message && (
        <p
          className={`text-sm ${
            message.type === "ok"
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {message.text}
        </p>
      )}
      <p className="text-xs text-[var(--muted)]">
        Check spam or promotions folders. Links expire after a while — request a new one if needed.
      </p>
    </div>
  );
}
