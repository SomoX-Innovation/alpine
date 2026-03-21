import { ORDER_STEPS, getStepStates, isCancelled } from "@/lib/order-status";

export default function OrderStatusTimeline({ status }: { status: string }) {
  if (isCancelled(status)) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-800 dark:text-red-300">
        This order was cancelled. If you have questions, please contact support.
      </div>
    );
  }

  const states = getStepStates(status);
  if (!states) return null;

  return (
    <div className="relative">
      <h3 className="text-sm font-semibold text-[var(--foreground)]">Order progress</h3>
      <ol className="mt-4 space-y-0">
        {ORDER_STEPS.map((step, i) => {
          const st = states[i];
          const complete = st === "complete";
          const current = st === "current";
          return (
            <li key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
              {i < ORDER_STEPS.length - 1 && (
                <div
                  className={`absolute left-[15px] top-8 h-[calc(100%-0.5rem)] w-0.5 ${
                    states[i] === "complete" ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                  }`}
                  aria-hidden
                />
              )}
              <div
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                  complete
                    ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--background)]"
                    : current
                      ? "border-[var(--accent)] bg-[var(--card)] text-[var(--accent)] ring-2 ring-[var(--accent)]/30"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--muted)]"
                }`}
              >
                {complete ? "✓" : i + 1}
              </div>
              <div className="min-w-0 pt-0.5">
                <p
                  className={`text-sm font-medium ${
                    complete || current ? "text-[var(--foreground)]" : "text-[var(--muted)]"
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-[var(--muted)]">{step.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
