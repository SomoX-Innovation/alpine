import Image from "next/image";
import Link from "next/link";
import { getCategories } from "@/lib/categories-db";
import { getNewDesignImage } from "@/lib/settings-db";

const categories = [
  {
    slug: "women",
    href: "/women",
    label: "Women",
    description: "Clothing for her",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
  },
  {
    slug: "men",
    href: "/men",
    label: "Men",
    description: "Clothing for him",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80",
  },
  {
    slug: "dtf",
    href: "/dtf",
    label: "DTF",
    description: "Direct to Film prints",
    image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80",
  },
  {
    slug: "new-arrivals",
    href: "/new-arrivals",
    label: "New Designs",
    description: "Latest drops",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
  },
];

export default async function CategoryGrid() {
  const dbCategories = await getCategories();
  const newDesignImage = await getNewDesignImage();
  const imageBySlug = new Map(
    dbCategories
      .filter((c) => c.image && c.slug)
      .map((c) => [c.slug.toLowerCase(), c.image as string])
  );
  const imageByName = new Map(
    dbCategories
      .filter((c) => c.image && c.name)
      .map((c) => [c.name.toLowerCase(), c.image as string])
  );

  const viewCategories = categories.map((cat) => ({
    ...cat,
    image:
      cat.slug === "new-arrivals"
        ? newDesignImage || cat.image
        : imageBySlug.get(cat.slug) || imageByName.get(cat.label.toLowerCase()) || cat.image,
  }));

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
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {viewCategories.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="group relative aspect-[2/3] overflow-hidden rounded-xl bg-[var(--muted-bg)]"
          >
            <Image
              src={cat.image}
              alt={cat.label}
              fill
              unoptimized={cat.image.includes("/storage/v1/object/public/")}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 bg-black/15 p-4 sm:p-5 text-white">
              <h3 className="font-display text-xl sm:text-2xl font-semibold [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
                {cat.label}
              </h3>
              <p className="mt-1 text-sm text-white/95 [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
                {cat.description}
              </p>
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
