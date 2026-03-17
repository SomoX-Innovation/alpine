import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Terms — Alpine",
  description: "Terms of service.",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-semibold text-[var(--foreground)]">
            Terms of service
          </h1>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Last updated: {new Date().toLocaleDateString("en-GB")}
          </p>
          <div className="mt-8 space-y-6 text-[var(--foreground)]/90">
            <section>
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                Use of the site
              </h2>
              <p className="mt-2">
                By using Alpine&apos;s website and services, you agree to these terms.
                You must be of legal age to place orders and provide accurate
                information.
              </p>
            </section>
            <section>
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                Orders and payment
              </h2>
              <p className="mt-2">
                Orders are subject to availability. We reserve the right to
                refuse or cancel orders. Prices are in LKR (Sri Lankan Rupees) and include VAT where
                applicable. Payment is due at checkout.
              </p>
            </section>
            <section>
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                Returns
              </h2>
              <p className="mt-2">
                Our return policy is described on the Shipping & Returns page.
                By placing an order you agree to those terms.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
