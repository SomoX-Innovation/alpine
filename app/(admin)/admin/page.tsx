import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { getSessionEmail } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const email = await getSessionEmail();
  const supabase = createServerClient();
  let productCount = 0;
  let orderCount = 0;
  let ordersToday = 0;
  let recentOrders: { id: string; order_number: string; created_at: string; total: number; status: string }[] = [];

  if (supabase != null) {
    try {
      const [productsRes, ordersRes, todayRes, recentRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .gte("created_at", new Date().toISOString().slice(0, 10) + "T00:00:00.000Z"),
        supabase
          .from("orders")
          .select("id, order_number, created_at, total, status")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);
      productCount = productsRes.count ?? 0;
      orderCount = ordersRes.count ?? 0;
      ordersToday = todayRes.count ?? 0;
      recentOrders = (recentRes.data ?? []) as typeof recentOrders;
    } catch {
      // Supabase not configured or tables missing
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Logged in as {email}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-sm text-[var(--muted)]">Products</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
            {productCount}
          </p>
          <Link
            href="/admin/products"
            className="mt-2 block text-sm text-[var(--accent)] hover:underline"
          >
            Manage →
          </Link>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-sm text-[var(--muted)]">Total orders</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
            {orderCount}
          </p>
          <Link
            href="/admin/orders"
            className="mt-2 block text-sm text-[var(--accent)] hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-sm text-[var(--muted)]">Orders today</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
            {ordersToday}
          </p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
          Recent orders
        </h2>
        {recentOrders.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">
            No orders yet. Orders will appear here after customers checkout.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--border)]">
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
                {recentOrders.map((order) => (
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
      </section>
    </div>
  );
}
