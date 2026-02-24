import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy — Alpine",
  description: "Privacy policy.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-semibold text-[var(--foreground)]">
            Privacy policy
          </h1>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Last updated: {new Date().toLocaleDateString("en-GB")}
          </p>
          <div className="mt-8 space-y-6 text-[var(--foreground)]/90">
            <section>
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                Information we collect
              </h2>
              <p className="mt-2">
                We collect information you provide when you create an account,
                place an order, or contact us. This may include name, email,
                address, and payment details. We also collect usage data to
                improve our site.
              </p>
            </section>
            <section>
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                How we use it
              </h2>
              <p className="mt-2">
                We use your information to process orders, send updates, and
                improve our services. We do not sell your data to third parties.
              </p>
            </section>
            <section>
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                Your rights
              </h2>
              <p className="mt-2">
                You may request access, correction, or deletion of your data. Contact
                us at privacy@alpine.example.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
