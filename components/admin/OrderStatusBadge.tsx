import { getStatusDisplay } from "@/lib/order-status";

export default function OrderStatusBadge({ status }: { status: string }) {
  const { label, tone } = getStatusDisplay(status);
  const cls =
    tone === "success"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
      : tone === "warning"
        ? "bg-amber-500/15 text-amber-800 dark:text-amber-300"
        : tone === "danger"
          ? "bg-red-500/15 text-red-700 dark:text-red-400"
          : "bg-[var(--muted-bg)] text-[var(--foreground)]";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}
    >
      {label}
    </span>
  );
}
