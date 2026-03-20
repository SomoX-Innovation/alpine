import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getSizeChartImages } from "@/lib/settings-db";

export const metadata = {
  title: "Size Guide — Alpine",
  description: "How to find your size.",
};

export default async function SizeGuidePage() {
  const charts = await getSizeChartImages();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-semibold text-[var(--foreground)]">
            Size guide
          </h1>
          <p className="mt-4 text-[var(--foreground)]/90">
            Measure yourself with a soft tape. Compare to the charts below. If
            you&apos;re between sizes, we recommend sizing up for comfort.
          </p>

          {(charts.regular || charts.oversized) && (
            <div className="mt-8 space-y-8">
              {charts.regular && (
                <div>
                  <h2 className="font-display text-xl font-semibold text-[var(--foreground)]">
                    Regular T-Shirt Size Chart
                  </h2>
                  <img
                    src={charts.regular}
                    alt="Regular t-shirt size chart"
                    className="mt-3 w-full rounded-lg border border-[var(--border)]"
                    loading="lazy"
                  />
                </div>
              )}
              {charts.oversized && (
                <div>
                  <h2 className="font-display text-xl font-semibold text-[var(--foreground)]">
                    Oversized T-Shirt Size Chart
                  </h2>
                  <img
                    src={charts.oversized}
                    alt="Oversized t-shirt size chart"
                    className="mt-3 w-full rounded-lg border border-[var(--border)]"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          )}

          <Link
            href="/women"
            className="mt-10 inline-block text-[var(--accent)] font-medium hover:underline"
          >
            Shop women →
          </Link>
          <span className="mx-2 text-[var(--muted)]">|</span>
          <Link
            href="/men"
            className="text-[var(--accent)] font-medium hover:underline"
          >
            Shop men →
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
