import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Sustainability — Alpine",
  description: "Our commitment to responsible production and the environment.",
};

export default function SustainabilityPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
            Sustainability
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[var(--foreground)]/90">
            We believe quality and responsibility go together. Alpine is committed
            to reducing our impact while delivering clothes that last.
          </p>

          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-[var(--foreground)]">
              Responsible materials
            </h2>
            <p className="mt-3 text-[var(--foreground)]/90">
              We use GOTS-certified or Better Cotton where possible and choose
              blanks that are built to last. DTF printing uses water-based inks
              and produces less waste than traditional screen printing.
            </p>
            <ul className="mt-4 space-y-2 text-[var(--foreground)]/90">
              <li>• Cotton from more sustainable sources</li>
              <li>• Water-based, phthalate-free inks</li>
              <li>• No heavy plastisol—lighter, longer-lasting prints</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-[var(--foreground)]">
              Made to last
            </h2>
            <p className="mt-3 text-[var(--foreground)]/90">
              The best way to reduce waste is to make products people keep. Our
              DTF prints hold up wash after wash, and we stand behind the quality
              of every piece we ship.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-[var(--foreground)]">
              Packaging & shipping
            </h2>
            <p className="mt-3 text-[var(--foreground)]/90">
              We use recyclable and recycled packaging where we can and work with
              carriers that offer carbon-neutral options. We’re constantly
              reviewing how we can do better.
            </p>
          </section>

          <Link
            href="/about"
            className="mt-10 inline-block text-[var(--accent)] font-medium hover:underline"
          >
            More about Alpine →
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
