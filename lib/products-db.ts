import type { Product, ProductCategory } from "@/lib/types";
import { createServerClient } from "@/lib/supabase";

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  category: string;
  badge: string | null;
  color: string | null;
  sizes: string[];
  image: string;
  images: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
};

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: Number(row.price),
    priceFormatted: `€${Number(row.price)}`,
    compareAtPrice: row.compare_at_price != null ? Number(row.compare_at_price) : undefined,
    category: row.category as ProductCategory,
    image: row.image,
    images: Array.isArray(row.images) ? row.images : [row.image],
    badge: row.badge === "New" || row.badge === "Sale" ? row.badge : undefined,
    description: row.description ?? "",
    sizes: Array.isArray(row.sizes) ? row.sizes : ["S", "M", "L", "XL", "XXL"],
    color: row.color ?? undefined,
  };
}

export async function getAllProducts(includeUnpublished = false): Promise<ProductRow[]> {
  const supabase = createServerClient();
  if (!supabase) return [];
  let query = supabase.from("products").select("*").order("created_at", { ascending: false });
  if (!includeUnpublished) {
    query = query.eq("published", true);
  }
  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as ProductRow[];
}

export async function getProductsForStorefront(): Promise<Product[]> {
  const rows = await getAllProducts(false);
  return rows.map(rowToProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = createServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("products").select("*").eq("id", id).eq("published", true).single();
  if (error || !data) return null;
  return rowToProduct(data as ProductRow);
}

export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  const supabase = createServerClient();
  if (!supabase) return [];
  let query = supabase.from("products").select("*").eq("published", true);
  if (category === "Unisex") {
    query = query.eq("category", "Unisex");
  } else {
    query = query.or(`category.eq.${category},category.eq.Unisex`);
  }
  const { data, error } = await query;
  if (error) return [];
  return ((data ?? []) as ProductRow[]).map(rowToProduct);
}

export async function getNewArrivals(): Promise<Product[]> {
  const supabase = createServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("products").select("*").eq("published", true).eq("badge", "New");
  if (error) return [];
  return ((data ?? []) as ProductRow[]).map(rowToProduct);
}

export async function getSaleProducts(): Promise<Product[]> {
  const supabase = createServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("products").select("*").eq("published", true).or("badge.eq.Sale,compare_at_price.not.is.null");
  if (error) return [];
  return ((data ?? []) as ProductRow[]).map(rowToProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = createServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("products").select("*").eq("published", true).or("badge.eq.New,badge.eq.Sale").limit(6);
  if (error) return [];
  return ((data ?? []) as ProductRow[]).map(rowToProduct);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const supabase = createServerClient();
  if (!supabase) return [];
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const { data, error } = await supabase.from("products").select("*").eq("published", true);
  if (error) return [];
  const rows = (data ?? []) as ProductRow[];
  return rows
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.color && p.color.toLowerCase().includes(q))
    )
    .map(rowToProduct);
}

export async function getProductRowById(id: string): Promise<ProductRow | null> {
  const supabase = createServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  if (error || !data) return null;
  return data as ProductRow;
}
