import Link from "next/link";
import { ORDER_STATUSES } from "../data";

type Stats = {
  total: number;
  byStatus: Record<(typeof ORDER_STATUSES)[number], number>;
};

function buildHref(status: string | "all", q: string): string {
  const p = new URLSearchParams();
  if (status !== "all") p.set("status", status);
  if (q.trim()) p.set("q", q.trim());
  const s = p.toString();
  return s ? `/admin/orders?${s}` : "/admin/orders";
}

export default function OrdersToolbar({
  stats,
  currentStatus,
  q,
}: {
  stats: Stats;
  currentStatus: string;
  q: string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] to-[var(--muted-bg)] p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">All orders</p>
          <p className="mt-1 font-display text-3xl font-semibold text-[var(--foreground)]">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Need attention</p>
          <p className="mt-1 font-display text-3xl font-semibold text-amber-700 dark:text-amber-400">
            {(stats.byStatus.pending ?? 0) + (stats.byStatus.paid ?? 0)}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">Pending + paid</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">In progress</p>
          <p className="mt-1 font-display text-3xl font-semibold text-[var(--foreground)]">
            {stats.byStatus.processing ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Shipped / done</p>
          <p className="mt-1 font-display text-3xl font-semibold text-emerald-700 dark:text-emerald-400">
            {(stats.byStatus.shipped ?? 0) + (stats.byStatus.delivered ?? 0)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All", stats.total],
              ...ORDER_STATUSES.map((s) => [s, s, stats.byStatus[s] ?? 0] as const),
            ] as const
          ).map(([key, label, count]) => {
            const active = currentStatus === key;
            return (
              <Link
                key={key}
                href={buildHref(key, q)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "bg-[var(--muted-bg)] text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <span className="capitalize">{label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    active ? "bg-[var(--background)]/20" : "bg-[var(--border)]"
                  }`}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </div>

        <form method="get" action="/admin/orders" className="flex w-full max-w-md gap-2 sm:w-auto">
          {currentStatus !== "all" && <input type="hidden" name="status" value={currentStatus} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search order #, name, email…"
            className="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            autoComplete="off"
          />
          <button
            type="submit"
            className="shrink-0 rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] hover:bg-[var(--accent)]"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
}
