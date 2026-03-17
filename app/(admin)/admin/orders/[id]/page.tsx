import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/app/actions/orders";
import OrderDetailForm from "../components/OrderDetailForm";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div>
      <Link
        href="/admin/orders"
        className="text-sm text-[var(--accent)] hover:underline"
      >
        ← Orders
      </Link>
      <h1 className="mt-4 font-display text-2xl font-semibold text-[var(--foreground)]">
        Order {order.order_number}
      </h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {new Date(order.created_at).toLocaleString()}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
              Customer
            </h2>
            <p className="mt-1 text-[var(--foreground)]">{order.customer_name}</p>
            <p className="text-sm text-[var(--muted)]">{order.customer_email}</p>
          </section>
          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
              Shipping address
            </h2>
            <p className="mt-1 text-[var(--foreground)]">
              {order.shipping_address?.address ?? "—"}
            </p>
            <p className="text-[var(--foreground)]">
              {order.shipping_address?.postalCode} {order.shipping_address?.city}
            </p>
            <p className="text-[var(--foreground)]">
              {order.shipping_address?.country}
            </p>
          </section>
          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
              Items
            </h2>
            <ul className="mt-2 space-y-2">
              {(order.line_items ?? []).map((item, i) => (
                <li
                  key={i}
                  className="flex justify-between text-sm text-[var(--foreground)]"
                >
                  <span>
                    {item.name} — {item.size} × {item.quantity}
                  </span>
                  <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1 border-t border-[var(--border)] pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--muted)]">Subtotal</dt>
                <dd>Rs. {Number(order.subtotal).toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--muted)]">Shipping</dt>
                <dd>Rs. {Number(order.shipping_cost).toFixed(2)}</dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>Total</dt>
                <dd>Rs. {Number(order.total).toFixed(2)}</dd>
              </div>
            </dl>
          </section>
        </div>
        <div>
          <OrderDetailForm order={order} />
        </div>
      </div>
    </div>
  );
}
