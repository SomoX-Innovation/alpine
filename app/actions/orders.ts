"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase";

export type OrderLineItem = {
  productId: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
};

export type CreateOrderInput = {
  customer_email: string;
  customer_name: string;
  shipping_address: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  line_items: OrderLineItem[];
  subtotal: number;
  shipping_cost: number;
  total: number;
};

export async function createOrder(input: CreateOrderInput): Promise<{ order_number?: string; error?: string }> {
  const supabase = createServerClient();
  if (!supabase) {
    return { error: "Orders are not available. Please try again later." };
  }
  const { count } = await supabase.from("orders").select("id", { count: "exact", head: true });
  const order_number = `ALP-${1001 + (count ?? 0)}`;

  const { error } = await supabase.from("orders").insert({
    order_number,
    status: "paid",
    customer_email: input.customer_email.trim().toLowerCase(),
    customer_name: input.customer_name,
    shipping_address: input.shipping_address,
    line_items: input.line_items,
    subtotal: input.subtotal,
    shipping_cost: input.shipping_cost,
    total: input.total,
  });

  if (error) {
    return { error: error.message };
  }
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  return { order_number };
}

export async function updateOrder(
  id: string,
  updates: { status?: string; tracking_code?: string; tracking_carrier?: string }
): Promise<{ error?: string }> {
  const supabase = createServerClient();
  if (!supabase) return { error: "Database not configured." };
  const { error } = await supabase
    .from("orders")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  return {};
}

export type OrderLookupResult = {
  order_number: string;
  status: string;
  tracking_code: string | null;
  tracking_carrier: string | null;
  created_at: string;
  line_items: OrderLineItem[];
  total: number;
} | null;

export async function getOrderByNumberAndEmail(
  order_number: string,
  email: string
): Promise<OrderLookupResult> {
  const supabase = createServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("orders")
    .select("order_number, status, tracking_code, tracking_carrier, created_at, line_items, total")
    .eq("order_number", order_number.trim())
    .eq("customer_email", email.trim().toLowerCase())
    .single();
  if (error || !data) return null;
  return data as OrderLookupResult;
}

export type OrderDetail = {
  id: string;
  order_number: string;
  status: string;
  customer_email: string;
  customer_name: string;
  shipping_address: { address: string; city: string; postalCode: string; country: string };
  line_items: OrderLineItem[];
  subtotal: number;
  shipping_cost: number;
  total: number;
  tracking_code: string | null;
  tracking_carrier: string | null;
  created_at: string;
  updated_at: string;
};

export async function getOrderById(id: string): Promise<OrderDetail | null> {
  const supabase = createServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("orders").select("*").eq("id", id).single();
  if (error || !data) return null;
  return data as OrderDetail;
}
