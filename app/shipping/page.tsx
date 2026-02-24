import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

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
              <li>• Free standard shipping on orders over €50.</li>
              <li>• Standard delivery: 3–5 business days (EU).</li>
              <li>• Express options available at checkout.</li>
              <li>• We ship to EU addresses only at this time.</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-[var(--foreground)]">
              Returns
            </h2>
            <ul className="mt-4 space-y-2 text-[var(--foreground)]/90">
              <li>• 30-day return window for full-price items.</li>
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
