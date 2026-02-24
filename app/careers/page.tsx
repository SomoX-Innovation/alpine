import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Careers — Alpine",
  description: "Join the Alpine team.",
};

export default function CareersPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
            Careers
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[var(--foreground)]/90">
            We’re a small team focused on great design and great apparel. If you
            care about quality and want to build something people actually wear,
            we’d like to hear from you.
          </p>

          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-[var(--foreground)]">
              Why join Alpine
            </h2>
            <ul className="mt-4 space-y-2 text-[var(--foreground)]/90">
              <li>• Work on a single, focused product: premium apparel</li>
              <li>• Small team, real impact on design and experience</li>
              <li>• Flexible, remote-friendly culture</li>
              <li>• Fair pay and a focus on sustainability</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-[var(--foreground)]">
              Open roles
            </h2>
            <p className="mt-3 text-[var(--foreground)]/90">
              We don’t have any open positions listed right now, but we’re always
              interested in meeting people who are passionate about apparel,
              design, or e‑commerce. Send us your CV and a short note about what
              you’re looking for.
            </p>
            <p className="mt-4 text-sm text-[var(--muted)]">
              Email: careers@alpine.example.com
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-[var(--foreground)]">
              What we look for
            </h2>
            <p className="mt-3 text-[var(--foreground)]/90">
              We value clear communication, attention to detail, and a
              willingness to own projects from idea to launch. Experience in
              fashion, print, or DTC is a plus but not required.
            </p>
          </section>

          <Link
            href="/contact"
            className="mt-10 inline-block text-[var(--accent)] font-medium hover:underline"
          >
            Get in touch →
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
