import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import CategoryGrid from "@/components/CategoryGrid";
import ProductCard from "@/components/ProductCard";
import { getFeaturedProducts } from "@/lib/products-db";
import { getHeroImage } from "@/lib/settings-db";
import { CURRENCY } from "@/lib/currency";
import Link from "next/link";

export default async function Home() {
  const featured = await getFeaturedProducts();

  const heroImageSrc = await getHeroImage();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero heroImageSrc={heroImageSrc} />
        <CategoryGrid />

        {/* Featured products */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
                New designs
              </h2>
              <p className="mt-2 text-[var(--muted)]">
                Latest DTF print drops
              </p>
            </div>
            <Link
              href="/new-arrivals"
              className="text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)]"
            >
              View all →
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* CTA strip */}
        <section className="border-y border-[var(--border)] bg-[var(--muted-bg)]">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="flex flex-col items-center text-center">
              <h2 className="font-display text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
                Free shipping on orders over {CURRENCY.symbol} {CURRENCY.freeShippingThreshold.toLocaleString()}
              </h2>
              <p className="mt-2 text-[var(--muted)]">
                DTF prints that last. Easy returns within 7 days.
              </p>
              <Link
                href="/sale"
                className="mt-6 inline-flex items-center justify-center rounded-md bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-[var(--background)] transition-colors hover:bg-[var(--accent)]"
              >
                Shop Sale
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
