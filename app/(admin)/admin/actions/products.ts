"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase";
import type { ProductFit } from "@/lib/types";

const BUCKET = "product-images";

function parseFitsFromForm(formData: FormData): ProductFit[] {
  const raw = formData.getAll("fits").map((x) => String(x).trim());
  const set = new Set<ProductFit>();
  for (const r of raw) {
    if (r === "Oversize" || r === "Regular") set.add(r);
  }
  return Array.from(set);
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function getUniqueProductSlug(
  supabase: NonNullable<ReturnType<typeof createServerClient>>,
  desiredSlug: string,
  excludeId?: string
): Promise<string> {
  const base = normalizeSlug(desiredSlug) || "product";
  const { data, error } = await supabase
    .from("products")
    .select("id, slug")
    .ilike("slug", `${base}%`);

  if (error || !data) return base;

  const taken = new Set(
    data
      .filter((row) => !excludeId || row.id !== excludeId)
      .map((row) => String(row.slug))
  );

  if (!taken.has(base)) return base;

  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export async function uploadProductImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { error: "No file provided." };
  }
  const supabase = createServerClient();
  if (!supabase) {
    return { error: "Storage not configured." };
  }
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const { data, error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    return { error: error.message };
  }
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return { url: urlData.publicUrl };
}

export async function createProduct(formData: FormData): Promise<{ id?: string; error?: string }> {
  const supabase = createServerClient();
  if (!supabase) {
    return { error: "Database not configured." };
  }
  const name = (formData.get("name") as string)?.trim() ?? "";
  const rawSlug = (formData.get("slug") as string) || name;
  const slug = await getUniqueProductSlug(supabase, rawSlug);
  const description = (formData.get("description") as string)?.trim() ?? "";
  const price = Number(formData.get("price")) || 0;
  const compareAtPriceRaw = formData.get("compare_at_price");
  const compareAtPrice = compareAtPriceRaw ? Number(compareAtPriceRaw) : null;
  const category = (formData.get("category") as string) || "Unisex";
  const badge = (formData.get("badge") as string) || null;
  const fits = parseFitsFromForm(formData);
  const fit = fits[0] ?? null;
  const item_code = (formData.get("item_code") as string)?.trim() || null;
  const colors = formData.getAll("colors").map((c) => String(c).trim()).filter(Boolean);
  const colorImagesRaw = (formData.get("color_images") as string)?.trim() || "{}";
  let colorImages: Record<string, string> = {};
  try {
    const parsed = JSON.parse(colorImagesRaw);
    if (parsed && typeof parsed === "object") {
      colorImages = Object.fromEntries(
        Object.entries(parsed as Record<string, unknown>)
          .filter(([k, v]) => k.trim().length > 0 && typeof v === "string" && v.trim().length > 0)
          .map(([k, v]) => [k, String(v).trim()])
      );
    }
  } catch {
    colorImages = {};
  }
  const sizesStr = (formData.get("sizes") as string)?.trim() || "S,M,L,XL,XXL";
  const sizes = sizesStr.split(",").map((s) => s.trim()).filter(Boolean);
  const ordered_quantity = Math.max(0, Math.floor(Number(formData.get("ordered_quantity")) || 0));
  const image = (formData.get("image") as string)?.trim() || "";
  const published = formData.get("published") === "on" || formData.get("published") === "true";

  if (!name || !slug) {
    return { error: "Name and slug are required." };
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      name,
      slug,
      description,
      price,
      compare_at_price: compareAtPrice,
      category: category as "Women" | "Men" | "Unisex" | "DTF",
      badge: badge === "New" || badge === "Sale" ? badge : null,
      fit,
      fits,
      item_code,
      colors,
      color_images: colorImages,
      sizes,
      ordered_quantity,
      image: image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
      images: image ? [image] : [],
      published,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }
  revalidatePath("/admin/products");
  revalidatePath(`/product/${data.id}`);
  revalidatePath("/admin/dtf");
  revalidatePath("/admin");
  revalidatePath("/");
  return { id: data.id };
}

export async function updateProduct(
  id: string,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = createServerClient();
  if (!supabase) {
    return { error: "Database not configured." };
  }
  const name = (formData.get("name") as string)?.trim() ?? "";
  const rawSlug = (formData.get("slug") as string) || name;
  const slug = await getUniqueProductSlug(supabase, rawSlug, id);
  const description = (formData.get("description") as string)?.trim() ?? "";
  const price = Number(formData.get("price")) || 0;
  const compareAtPriceRaw = formData.get("compare_at_price");
  const compareAtPrice = compareAtPriceRaw ? Number(compareAtPriceRaw) : null;
  const category = (formData.get("category") as string) || "Unisex";
  const badge = (formData.get("badge") as string) || null;
  const fits = parseFitsFromForm(formData);
  const fit = fits[0] ?? null;
  const item_code = (formData.get("item_code") as string)?.trim() || null;
  const colors = formData.getAll("colors").map((c) => String(c).trim()).filter(Boolean);
  const colorImagesRaw = (formData.get("color_images") as string)?.trim() || "{}";
  let colorImages: Record<string, string> = {};
  try {
    const parsed = JSON.parse(colorImagesRaw);
    if (parsed && typeof parsed === "object") {
      colorImages = Object.fromEntries(
        Object.entries(parsed as Record<string, unknown>)
          .filter(([k, v]) => k.trim().length > 0 && typeof v === "string" && v.trim().length > 0)
          .map(([k, v]) => [k, String(v).trim()])
      );
    }
  } catch {
    colorImages = {};
  }
  const sizesStr = (formData.get("sizes") as string)?.trim() || "S,M,L,XL,XXL";
  const sizes = sizesStr.split(",").map((s) => s.trim()).filter(Boolean);
  const ordered_quantity = Math.max(0, Math.floor(Number(formData.get("ordered_quantity")) || 0));
  const image = (formData.get("image") as string)?.trim() || "";
  const published = formData.get("published") === "on" || formData.get("published") === "true";

  const { error } = await supabase
    .from("products")
    .update({
      name,
      slug,
      description,
      price,
      compare_at_price: compareAtPrice,
      category: category as "Women" | "Men" | "Unisex" | "DTF",
      badge: badge === "New" || badge === "Sale" ? badge : null,
      fit,
      fits,
      item_code,
      colors,
      color_images: colorImages,
      sizes,
      ordered_quantity,
      image: image || undefined,
      images: image ? [image] : [],
      published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}/edit`);
  revalidatePath(`/product/${id}`);
  revalidatePath("/admin/dtf");
  revalidatePath("/admin");
  revalidatePath("/");
  return {};
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  const supabase = createServerClient();
  if (!supabase) {
    return { error: "Database not configured." };
  }
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/admin/products");
  revalidatePath("/admin/dtf");
  revalidatePath("/admin");
  revalidatePath("/");
  return {};
}
