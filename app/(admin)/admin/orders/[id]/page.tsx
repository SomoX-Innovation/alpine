import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/app/actions/orders";
import OrderDetailForm from "../components/OrderDetailForm";
import OrderLineItemsList from "@/components/OrderLineItemsList";
import OrderStatusTimeline from "@/components/OrderStatusTimeline";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";

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
        ← Order management
      </Link>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
            Order {order.order_number}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {new Date(order.created_at).toLocaleString(undefined, {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
            <OrderStatusTimeline status={order.status} />
          </section>
          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
              Customer
            </h2>
            <p className="mt-1 text-[var(--foreground)]">{order.customer_name}</p>
            <p className="text-sm text-[var(--muted)]">{order.customer_email}</p>
            <p className="mt-2 text-sm text-[var(--foreground)]">
              <span className="text-[var(--muted)]">Payment: </span>
              {order.payment_method === "cod"
                ? "Cash on delivery"
                : order.payment_method === "card"
                  ? "Card"
                  : (order.payment_method as string) || "—"}
            </p>
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
            <OrderLineItemsList items={order.line_items ?? []} variant="compact" />
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
