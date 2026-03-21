import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import { fetchAdminOrders, fetchOrderStats, ORDER_STATUSES } from "./data";
import OrdersToolbar from "./components/OrdersToolbar";

type Props = {
  searchParams: Promise<{ status?: string; q?: string }>;
};

function paymentLabel(method: string): string {
  if (method === "cod") return "COD";
  if (method === "card") return "Card";
  return method || "—";
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const rawStatus = sp.status ?? "";
  const status =
    rawStatus && ORDER_STATUSES.includes(rawStatus as (typeof ORDER_STATUSES)[number])
      ? rawStatus
      : undefined;
  const currentStatus = status ?? "all";
  const q = typeof sp.q === "string" ? sp.q : "";

  const supabase = createServerClient();

  let orders: Awaited<ReturnType<typeof fetchAdminOrders>> = [];
  let stats = {
    total: 0,
    byStatus: {
      pending: 0,
      paid: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    } as Record<(typeof ORDER_STATUSES)[number], number>,
  };

  if (supabase) {
    const [list, s] = await Promise.all([
      fetchAdminOrders(supabase, { status, q }),
      fetchOrderStats(supabase),
    ]);
    orders = list;
    stats = s;
  }

  return (
    <div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
            Order management
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Track, filter, and update fulfillment for every customer order.
          </p>
        </div>
        <Link
          href="/admin"
          className="text-sm text-[var(--accent)] hover:underline"
        >
          ← Dashboard
        </Link>
      </div>

      <div className="mt-8">
        <OrdersToolbar stats={stats} currentStatus={currentStatus} q={q} />
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-[var(--border)] bg-[var(--muted-bg)]/40 px-6 py-12 text-center">
          <p className="font-medium text-[var(--foreground)]">No orders match your filters</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {stats.total === 0
              ? "Orders will appear here when customers checkout."
              : "Try another status or clear the search."}
          </p>
          {(currentStatus !== "all" || q.trim()) && (
            <Link
              href="/admin/orders"
              className="mt-4 inline-block text-sm font-medium text-[var(--accent)] hover:underline"
            >
              View all orders
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-[var(--border)] shadow-sm">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted-bg)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--foreground)]">Order</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--foreground)]">Placed</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--foreground)]">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--foreground)]">Email</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--foreground)]">Payment</th>
                <th className="px-4 py-3 text-right font-medium text-[var(--foreground)]">Total</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--foreground)]">Status</th>
                <th className="px-4 py-3 text-right font-medium text-[var(--foreground)]">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted-bg)]/50"
                >
                  <td className="px-4 py-3 font-semibold text-[var(--foreground)]">
                    {order.order_number}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">
                    {new Date(order.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground)] max-w-[140px] truncate" title={order.customer_name}>
                    {order.customer_name}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)] max-w-[180px] truncate" title={order.customer_email}>
                    {order.customer_email}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{paymentLabel(order.payment_method)}</td>
                  <td className="px-4 py-3 text-right font-medium text-[var(--foreground)] whitespace-nowrap">
                    Rs. {Number(order.total).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-[var(--accent)] hover:underline"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
