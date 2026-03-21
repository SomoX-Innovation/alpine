import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCustomerOrderById } from "@/app/actions/orders";
import OrderStatusTimeline from "@/components/OrderStatusTimeline";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import CopyOrderNumberButton from "@/components/CopyOrderNumberButton";
import OrderLineItemsList from "@/components/OrderLineItemsList";

export const metadata = {
  title: "Order details — Alpine",
};

export default async function CustomerOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const showPlacedBanner = sp.placed === "1";

  const order = await getCustomerOrderById(id);
  if (!order) notFound();

  const paymentLabel =
    order.payment_method === "cod"
      ? "Cash on delivery"
      : order.payment_method === "card"
        ? "Card"
        : String(order.payment_method ?? "—");

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <Link href="/account" className="text-sm text-[var(--accent)] hover:underline">
            ← Back to account
          </Link>

          {showPlacedBanner && (
            <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-display text-lg font-semibold text-[var(--foreground)]">
                    Thank you — order placed
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    We&apos;re on it. You can track every step here. A confirmation is sent to{" "}
                    <span className="font-medium text-[var(--foreground)]">{order.customer_email}</span>.
                  </p>
                </div>
                <span className="shrink-0 text-2xl" aria-hidden>
                  ✓
                </span>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
                Order {order.order_number}
              </h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Placed {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <OrderStatusBadge status={order.status} />
              <CopyOrderNumberButton text={order.order_number} />
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-5">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 lg:col-span-2">
              <OrderStatusTimeline status={order.status} />
            </div>

            <div className="space-y-6 lg:col-span-3">
              <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Payment & total
                </h2>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[var(--muted)]">Method</dt>
                    <dd className="font-medium text-[var(--foreground)]">{paymentLabel}</dd>
                  </div>
                  {order.payment_method === "cod" && (
                    <p className="rounded-md bg-[var(--muted-bg)] px-3 py-2 text-xs text-[var(--muted)]">
                      Pay the driver in cash when your package arrives. Please keep the exact amount ready:{" "}
                      <strong className="text-[var(--foreground)]">Rs. {Number(order.total).toFixed(2)}</strong>
                    </p>
                  )}
                  <div className="flex justify-between border-t border-[var(--border)] pt-2">
                    <dt className="text-[var(--muted)]">Subtotal</dt>
                    <dd>Rs. {Number(order.subtotal).toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--muted)]">Shipping</dt>
                    <dd>Rs. {Number(order.shipping_cost).toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between text-base font-semibold">
                    <dt>Total</dt>
                    <dd>Rs. {Number(order.total).toFixed(2)}</dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Delivery address
                </h2>
                <p className="mt-3 text-sm text-[var(--foreground)]">{order.customer_name}</p>
                <p className="text-sm text-[var(--muted)]">{order.customer_email}</p>
                <p className="mt-2 text-sm text-[var(--foreground)]">{order.shipping_address?.address}</p>
                <p className="text-sm text-[var(--foreground)]">
                  {order.shipping_address?.postalCode} {order.shipping_address?.city}
                </p>
                <p className="text-sm text-[var(--foreground)]">{order.shipping_address?.country}</p>
              </section>

              <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
                <h2 className="text-base font-semibold uppercase tracking-wide text-[var(--foreground)]">
                  Items
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  What you ordered — photos match your selection at checkout.
                </p>
                <OrderLineItemsList items={order.line_items ?? []} variant="default" />
              </section>

              {order.tracking_code && (
                <section className="rounded-xl border border-[var(--accent)]/30 bg-[var(--muted-bg)]/50 p-5">
                  <h2 className="text-sm font-semibold text-[var(--foreground)]">Tracking</h2>
                  <p className="mt-2 font-mono text-sm text-[var(--foreground)]">{order.tracking_code}</p>
                  {order.tracking_carrier && (
                    <p className="text-xs text-[var(--muted)]">{order.tracking_carrier}</p>
                  )}
                </section>
              )}

              <section className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] p-5">
                <h2 className="text-sm font-semibold text-[var(--foreground)]">Need help?</h2>
                <ul className="mt-2 space-y-2 text-sm text-[var(--muted)]">
                  <li>
                    <Link href="/faq" className="text-[var(--accent)] hover:underline">
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link href="/shipping" className="text-[var(--accent)] hover:underline">
                      Shipping & returns
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-[var(--accent)] hover:underline">
                      Contact us
                    </Link>
                  </li>
                  <li>
                    <Link href="/track-order" className="text-[var(--accent)] hover:underline">
                      Track another order
                    </Link>
                  </li>
                </ul>
              </section>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/women"
                  className="inline-flex rounded-md bg-[var(--foreground)] px-5 py-2.5 text-sm font-semibold text-[var(--background)] hover:bg-[var(--accent)]"
                >
                  Continue shopping
                </Link>
                <Link
                  href="/account"
                  className="inline-flex rounded-md border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                >
                  All orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
