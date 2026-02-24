import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Size Guide — Alpine",
  description: "How to find your size.",
};

export default function SizeGuidePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-semibold text-[var(--foreground)]">
            Size guide
          </h1>
          <p className="mt-4 text-[var(--foreground)]/90">
            Measure yourself with a soft tape. Compare to the table below. If
            you&apos;re between sizes, we recommend sizing up for comfort.
          </p>

          <h2 className="font-display mt-10 text-xl font-semibold text-[var(--foreground)]">
            Women
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="py-2 text-left font-medium">Size</th>
                  <th className="py-2 text-left font-medium">Bust (cm)</th>
                  <th className="py-2 text-left font-medium">Waist (cm)</th>
                  <th className="py-2 text-left font-medium">Hips (cm)</th>
                </tr>
              </thead>
              <tbody className="text-[var(--muted)]">
                {[
                  ["XS", "82-86", "62-66", "88-92"],
                  ["S", "86-90", "66-70", "92-96"],
                  ["M", "90-94", "70-74", "96-100"],
                  ["L", "94-98", "74-78", "100-104"],
                  ["XL", "98-102", "78-82", "104-108"],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-[var(--border)]">
                    <td className="py-3 font-medium text-[var(--foreground)]">
                      {row[0]}
                    </td>
                    <td className="py-3">{row[1]}</td>
                    <td className="py-3">{row[2]}</td>
                    <td className="py-3">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="font-display mt-10 text-xl font-semibold text-[var(--foreground)]">
            Men
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="py-2 text-left font-medium">Size</th>
                  <th className="py-2 text-left font-medium">Chest (cm)</th>
                  <th className="py-2 text-left font-medium">Waist (cm)</th>
                  <th className="py-2 text-left font-medium">Hips (cm)</th>
                </tr>
              </thead>
              <tbody className="text-[var(--muted)]">
                {[
                  ["S", "86-90", "70-74", "88-92"],
                  ["M", "90-94", "74-78", "92-96"],
                  ["L", "94-98", "78-82", "96-100"],
                  ["XL", "98-102", "82-86", "100-104"],
                  ["XXL", "102-106", "86-90", "104-108"],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-[var(--border)]">
                    <td className="py-3 font-medium text-[var(--foreground)]">
                      {row[0]}
                    </td>
                    <td className="py-3">{row[1]}</td>
                    <td className="py-3">{row[2]}</td>
                    <td className="py-3">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
