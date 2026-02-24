import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "About — Alpine",
  description: "Our story and values.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
            About Alpine
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[var(--foreground)]/90">
            We focus on one thing: premium apparel.
            Vibrant, durable designs—made to last wash after wash.
          </p>
          <p className="mt-4 text-[var(--foreground)]/90">
            We pick every design and every piece so you get
            clothing that looks and feels great.
          </p>
          <h2 className="font-display mt-10 text-xl font-semibold text-[var(--foreground)]">
            Why DTF?
          </h2>
          <ul className="mt-4 space-y-2 text-[var(--foreground)]/90">
            <li>• Vibrant, photo-quality prints</li>
            <li>• Soft hand feel—no heavy plastisol</li>
            <li>• Durable through many washes</li>
          </ul>
          <Link
            href="/new-arrivals"
            className="mt-10 inline-block text-[var(--accent)] font-medium hover:underline"
          >
            Shop new designs →
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
