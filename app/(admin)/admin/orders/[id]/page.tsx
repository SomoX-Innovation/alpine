import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/app/actions/orders";
import { getAllProducts } from "@/lib/products-db";
import { productRowsToAdminOrderProducts } from "@/lib/admin-order-product-search";
import OrderDetailForm from "../components/OrderDetailForm";
import OrderItemsEditorClient from "../components/OrderItemsEditorClient";
import OrderStatusTimeline from "@/components/OrderStatusTimeline";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import { generateInvoiceForOrder } from "@/app/actions/orders";

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ inv?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const [order, productRows] = await Promise.all([getOrderById(id), getAllProducts(false)]);
  if (!order) notFound();
  const adminProducts = productRowsToAdminOrderProducts(productRows);

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
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Invoice</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Download the invoice PDF (branded with your logo). If it’s missing, generate it.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {order.invoice_path ? (
                <a
                  href={`/api/invoice/${order.id}`}
                  className="inline-flex rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-[var(--background)] hover:bg-[var(--accent)]"
                >
                  Download invoice (PDF)
                </a>
              ) : (
                <form
                  action={async () => {
                    "use server";
                    const res = await generateInvoiceForOrder(order.id);
                    if (res.error) {
                      redirect(`/admin/orders/${order.id}?inv=${encodeURIComponent(res.error)}`);
                    }
                    redirect(`/admin/orders/${order.id}?inv=generated`);
                  }}
                >
                  <button
                    type="submit"
                    className="inline-flex rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-[var(--background)] hover:bg-[var(--accent)]"
                  >
                    Generate invoice PDF
                  </button>
                </form>
              )}
            </div>
            {sp.inv && (
              <p className={`mt-2 text-xs ${sp.inv === "generated" ? "text-emerald-500" : "text-red-500"}`}>
                {sp.inv === "generated" ? "Invoice generated successfully." : sp.inv}
              </p>
            )}
            {order.invoice_path ? (
              <p className="mt-2 text-xs text-[var(--muted)]">
                Stored at: <span className="font-mono">{order.invoice_path}</span>
              </p>
            ) : null}
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
            <OrderItemsEditorClient orderId={order.id} initialItems={order.line_items ?? []} products={adminProducts} />
            <dl className="mt-4 space-y-1 border-t border-[var(--border)] pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--muted)]">Current subtotal</dt>
                <dd>Rs. {Number(order.subtotal).toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--muted)]">Current shipping</dt>
                <dd>Rs. {Number(order.shipping_cost).toFixed(2)}</dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>Current total</dt>
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
