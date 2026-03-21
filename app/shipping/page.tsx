import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { CURRENCY, SHIPPING_COUNTRY } from "@/lib/currency";

export const metadata = {
  title: "Shipping & Returns — Alpine",
  description: "Delivery and return information.",
};

export default function ShippingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-semibold text-[var(--foreground)]">
            Shipping & returns
          </h1>

          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-[var(--foreground)]">
              Shipping
            </h2>
            <ul className="mt-4 space-y-2 text-[var(--foreground)]/90">
              <li>
                • Standard shipping: Rs. {CURRENCY.shippingCost} on orders under Rs.{" "}
                {CURRENCY.freeShippingThreshold.toLocaleString()}.
              </li>
              <li>
                • Free standard shipping on orders over Rs.{" "}
                {CURRENCY.freeShippingThreshold.toLocaleString()}.
              </li>
              <li>• We ship to addresses in {SHIPPING_COUNTRY} only.</li>
              <li>• Standard delivery: typically 3–5 business days within {SHIPPING_COUNTRY}.</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-[var(--foreground)]">
              Returns
            </h2>
            <ul className="mt-4 space-y-2 text-[var(--foreground)]/90">
              <li>• 7-day return window for full-price items.</li>
              <li>• Items must be unworn, unwashed, with tags attached.</li>
              <li>• Refunds are processed to the original payment method.</li>
              <li>• Sale items may be final sale; check product page.</li>
            </ul>
          </section>

          <Link
            href="/faq"
            className="mt-10 inline-block text-[var(--accent)] font-medium hover:underline"
          >
            More in FAQ →
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
