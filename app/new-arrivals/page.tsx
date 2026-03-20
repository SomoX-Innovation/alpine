import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CollectionLayout from "@/components/CollectionLayout";
import { getNewArrivals } from "@/lib/products-db";
import Link from "next/link";

export const metadata = {
  title: "New Designs — Alpine",
  description: "Latest DTF print t-shirt drops.",
};

export default async function NewArrivalsPage() {
  const products = await getNewArrivals();
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
            <h2 className="font-display text-2xl font-semibold text-[var(--foreground)]">
              Customized T Shirt
            </h2>
            <p className="mt-2 text-[var(--muted)]">
              Upload your DTF designs for Chest, Front, and Back and place custom quantity orders.
            </p>
            <Link
              href="/customized-tshirt"
              className="mt-4 inline-flex rounded-md bg-[var(--foreground)] px-4 py-2.5 text-sm font-semibold text-[var(--background)] hover:bg-[var(--accent)]"
            >
              Start Custom Order
            </Link>
          </div>
        </div>
        <CollectionLayout
          title="New Designs"
          description="Fresh DTF print drops. New graphics, same premium quality."
          products={products}
        />
      </main>
      <Footer />
    </div>
  );
}
