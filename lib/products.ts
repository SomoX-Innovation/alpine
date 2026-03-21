import type { Product } from "@/lib/types";
import { CURRENCY } from "@/lib/currency";

const defaultSizes = ["S", "M", "L", "XL", "XXL"];
const DEFAULT_DESCRIPTION =
  "Premium apparel. Vibrant, durable design that stays soft wash after wash. Care: Wash inside out cold, tumble dry low.";

const baseProducts: Omit<
  Product,
  | "slug"
  | "priceFormatted"
  | "images"
  | "description"
  | "sizes"
  | "quantity"
  | "fits"
  | "orderedQuantity"
>[] = [
  {
    id: "1",
    name: "Retro Wave Graphic",
    price: 32,
    category: "Unisex",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    badge: "New",
    colors: ["Black"],
  },
  {
    id: "2",
    name: "Retro Wave Graphic",
    price: 32,
    category: "Unisex",
    image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80",
    colors: ["White"],
  },
  {
    id: "3",
    name: "Minimal Logo",
    price: 28,
    compareAtPrice: 34,
    category: "Men",
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
    badge: "Sale",
    colors: ["Heather Grey"],
  },
  {
    id: "4",
    name: "Minimal Logo",
    price: 28,
    category: "Men",
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80",
    colors: ["Navy"],
  },
  {
    id: "5",
    name: "Vintage Band",
    price: 35,
    category: "Unisex",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
    badge: "New",
    colors: ["Black"],
  },
  {
    id: "6",
    name: "Vintage Band",
    price: 35,
    category: "Unisex",
    image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80",
    colors: ["White"],
  },
  {
    id: "7",
    name: "Abstract Blob Print",
    price: 30,
    category: "Women",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
    badge: "New",
    colors: ["Off-White"],
  },
  {
    id: "8",
    name: "Abstract Blob Print",
    price: 30,
    category: "Women",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80",
    colors: ["Dusty Pink"],
  },
  {
    id: "9",
    name: "Typography Statement",
    price: 29,
    compareAtPrice: 34,
    category: "Unisex",
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
    badge: "Sale",
    colors: ["Black"],
  },
  {
    id: "10",
    name: "Typography Statement",
    price: 29,
    category: "Unisex",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80",
    colors: ["White"],
  },
  {
    id: "11",
    name: "Skull & Roses",
    price: 36,
    category: "Men",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80",
    badge: "New",
    colors: ["Black"],
  },
  {
    id: "12",
    name: "Skull & Roses",
    price: 36,
    category: "Men",
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80",
    colors: ["Charcoal"],
  },
  {
    id: "13",
    name: "Floral Crop",
    price: 31,
    category: "Women",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80",
    colors: ["White"],
  },
  {
    id: "14",
    name: "Floral Crop",
    price: 31,
    category: "Women",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80",
    colors: ["Lavender"],
  },
  {
    id: "15",
    name: "Neon Grid Graphic",
    price: 33,
    category: "Unisex",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    badge: "New",
    colors: ["Black"],
  },
  {
    id: "16",
    name: "Neon Grid Graphic",
    price: 33,
    category: "Unisex",
    image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80",
    colors: ["White"],
  },
  {
    id: "17",
    name: "Oversized Logo",
    price: 34,
    category: "Men",
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
    colors: ["Heather Grey"],
  },
  {
    id: "18",
    name: "Oversized Logo",
    price: 34,
    category: "Men",
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80",
    colors: ["Navy"],
  },
  {
    id: "19",
    name: "Sunset Gradient",
    price: 30,
    compareAtPrice: 36,
    category: "Unisex",
    image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80",
    badge: "Sale",
    colors: ["White"],
  },
  {
    id: "20",
    name: "Sunset Gradient",
    price: 30,
    category: "Unisex",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
    colors: ["Black"],
  },
];

function toProduct(p: (typeof baseProducts)[0]): Product {
  const slug =
    p.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") +
    (p.colors && p.colors.length > 0 ? `-${p.colors.join("-").toLowerCase().replace(/\s+/g, "-")}` : "");
  return {
    ...p,
    fits: [],
    slug,
    priceFormatted: CURRENCY.format(p.price),
    images: [p.image],
    description: DEFAULT_DESCRIPTION,
    sizes: defaultSizes,
    quantity: 0,
    orderedQuantity: 0,
  };
}

export const allProducts: Product[] = baseProducts.map(toProduct);

export const featuredProducts: Product[] = allProducts.filter(
  (p) => p.badge === "New" || p.badge === "Sale"
).slice(0, 6);

export function getProductById(id: string): Product | undefined {
  return allProducts.find((p) => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: Product["category"]): Product[] {
  if (category === "Unisex") return allProducts.filter((p) => p.category === "Unisex");
  return allProducts.filter((p) => p.category === category || p.category === "Unisex");
}

export function getNewArrivals(): Product[] {
  return allProducts.filter((p) => p.badge === "New");
}

export function getSaleProducts(): Product[] {
  return allProducts.filter((p) => p.badge === "Sale" || p.compareAtPrice != null);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.colors && p.colors.some((c) => c.toLowerCase().includes(q)))
  );
}
