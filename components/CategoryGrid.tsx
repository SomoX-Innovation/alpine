import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    href: "/women",
    label: "Women",
    description: "Clothing for her",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
  },
  {
    href: "/men",
    label: "Men",
    description: "Clothing for him",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80",
  },
  {
    href: "/new-arrivals",
    label: "New Designs",
    description: "Latest drops",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
  },
];

export default function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="text-center">
        <h2 className="font-display text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
          Shop by style
        </h2>
        <p className="mt-2 text-[var(--muted)]">
          Apparel in every style
        </p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-[var(--muted-bg)]"
          >
            <Image
              src={cat.image}
              alt={cat.label}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--foreground)]/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-[var(--background)]">
              <h3 className="font-display text-2xl font-semibold">{cat.label}</h3>
              <p className="mt-1 text-sm opacity-90">{cat.description}</p>
              <span className="mt-3 inline-block text-sm font-medium underline underline-offset-4 group-hover:text-[var(--gold-soft)]">
                Shop now
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
