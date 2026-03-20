"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase";

const BUCKET = "product-images";

export type CustomizedOrderInput = {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  tshirt_type: "Regular" | "Oversize";
  print_size: "A4" | "A3";
  placements: string[];
  design_urls: Record<string, string>;
  size_quantities: Record<string, number>;
  quantity: number;
  notes?: string;
  total: number;
};

export async function uploadDesignImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file provided." };

  const supabase = createServerClient();
  if (!supabase) return { error: "Storage not configured." };

  const ext = file.name.split(".").pop() || "jpg";
  const path = `customized/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const { data, error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return { error: error.message };
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return { url: urlData.publicUrl };
}

export async function createCustomizedOrder(input: CustomizedOrderInput): Promise<{ order_number?: string; error?: string }> {
  const supabase = createServerClient();
  if (!supabase) return { error: "Orders are not available. Please try again later." };

  const { count } = await supabase.from("customized_orders").select("id", { count: "exact", head: true });
  const order_number = `CUS-${1001 + (count ?? 0)}`;

  const { error } = await supabase.from("customized_orders").insert({
    order_number,
    status: "pending",
    customer_name: input.customer_name.trim(),
    customer_email: input.customer_email.trim().toLowerCase(),
    customer_phone: input.customer_phone.trim(),
    tshirt_type: input.tshirt_type,
    print_size: input.print_size,
    placements: input.placements,
    design_urls: input.design_urls,
    size_quantities: input.size_quantities,
    quantity: input.quantity,
    notes: input.notes ?? "",
    total: input.total,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/orders");
  return { order_number };
}
