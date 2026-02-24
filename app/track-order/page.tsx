import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrackOrderForm from "@/components/TrackOrderForm";

export const metadata = {
  title: "Track Order — Alpine",
  description: "Track your delivery.",
};

export default function TrackOrderPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
            Track your order
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Enter your order number and email to see status.
          </p>
          <TrackOrderForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
