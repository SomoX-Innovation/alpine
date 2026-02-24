import Link from "next/link";
import { createServerClient } from "@/lib/supabase";

export default async function AdminOrdersPage() {
  const supabase = createServerClient();
  let orders: { id: string; order_number: string; created_at: string; customer_email: string; total: number; status: string }[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("orders")
      .select("id, order_number, created_at, customer_email, total, status")
      .order("created_at", { ascending: false });
    orders = (data ?? []) as typeof orders;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
        Orders
      </h1>

      {orders.length === 0 ? (
        <p className="mt-8 text-[var(--muted)]">
          No orders yet. Orders will appear here when customers checkout.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted-bg)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--foreground)]">
                  Order
                </th>
                <th className="px-4 py-3 text-left font-medium text-[var(--foreground)]">
                  Date
                </th>
                <th className="px-4 py-3 text-left font-medium text-[var(--foreground)]">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-medium text-[var(--foreground)]">
                  Total
                </th>
                <th className="px-4 py-3 text-left font-medium text-[var(--foreground)]">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-[var(--foreground)]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                    {order.order_number}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {order.customer_email}
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground)]">
                    €{Number(order.total).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {order.status}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-[var(--accent)] hover:underline"
                    >
                      View
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
