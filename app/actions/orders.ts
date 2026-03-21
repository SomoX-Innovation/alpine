"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase";
import { createClient } from "@/lib/supabase-server";
import { sendOrderConfirmationEmail } from "@/lib/mail";
import { SHIPPING_COUNTRY } from "@/lib/currency";
import { createServiceRoleClient } from "@/lib/supabase-service";

const PRODUCT_ID_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Total units per product id (same product can appear on multiple lines). */
function aggregateNeedByProduct(lineItems: OrderLineItem[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const line of lineItems) {
    const pid = line.productId?.trim();
    if (!pid || !PRODUCT_ID_UUID.test(pid)) continue;
    const q = Math.max(0, Math.floor(Number(line.quantity)) || 0);
    if (q <= 0) continue;
    map.set(pid, (map.get(pid) ?? 0) + q);
  }
  return map;
}

/** Ensures cart lines reference published products (no inventory checks). */
async function validateProductsBeforeOrder(
  lineItems: OrderLineItem[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  const need = aggregateNeedByProduct(lineItems);
  if (need.size === 0) {
    return { ok: false, error: "Your cart has no valid products." };
  }
  const supabase = createServerClient();
  if (!supabase) {
    return { ok: false, error: "Store is unavailable." };
  }
  const ids = [...need.keys()];
  const { data: rows, error } = await supabase
    .from("products")
    .select("id, name, published")
    .in("id", ids);
  if (error) {
    return { ok: false, error: error.message };
  }
  const byId = new Map(
    (rows ?? []).map((r: { id: string; name: string; published: boolean }) => [
      r.id,
      { name: r.name, published: r.published },
    ])
  );
  for (const pid of need.keys()) {
    const row = byId.get(pid);
    if (!row || !row.published) {
      return { ok: false, error: "A product in your cart is no longer available." };
    }
  }
  return { ok: true };
}

/**
 * Increments `ordered_quantity` per product via RPC (requires service role).
 * Returns false if RPC failed (caller should delete the order row).
 */
async function applyOrderInventoryChanges(lineItems: OrderLineItem[]): Promise<boolean> {
  const svc = createServiceRoleClient();
  if (!svc) {
    console.warn(
      "[orders] SUPABASE_SERVICE_ROLE_KEY missing — ordered counts not updated. Add it for production."
    );
    return true;
  }
  const need = aggregateNeedByProduct(lineItems);
  const payload = [...need.entries()].map(([product_id, qty]) => ({ product_id, qty }));
  if (payload.length === 0) {
    return false;
  }
  const { error } = await svc.rpc("apply_order_inventory_changes", {
    p_lines: payload,
  });
  if (error) {
    console.error("[orders] apply_order_inventory_changes", error.message);
    return false;
  }
  return true;
}

async function deleteOrderById(orderId: string): Promise<void> {
  const svc = createServiceRoleClient();
  if (!svc) return;
  const { error } = await svc.from("orders").delete().eq("id", orderId);
  if (error) {
    console.error("[orders] failed to roll back order after ordered-count error", orderId, error.message);
  }
}

export type OrderLineItem = {
  productId: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
  /** Regular / Oversize when applicable */
  fit?: string;
  /** Product image URL at checkout (shown on order details & account) */
  image?: string;
};

export type PaymentMethod = "card" | "cod";

export type CreateOrderInput = {
  /** Ignored for security — order is tied to the signed-in user’s email. */
  customer_email?: string;
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
  /** card = mock checkout; cod = cash on delivery (pay when order arrives) */
  payment_method?: PaymentMethod;
};

export async function createOrder(input: CreateOrderInput): Promise<{
  order_number?: string;
  order_id?: string;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return { error: "You must be signed in to place an order. Please sign in and try again." };
  }

  const customer_email = user.email.trim().toLowerCase();
  const customer_name = input.customer_name.trim() || user.email.split("@")[0] || "Customer";

  const country = input.shipping_address.country?.trim() ?? "";
  if (country !== SHIPPING_COUNTRY) {
    return { error: `We only ship to ${SHIPPING_COUNTRY}.` };
  }

  const productCheck = await validateProductsBeforeOrder(input.line_items);
  if (!productCheck.ok) {
    return { error: productCheck.error };
  }

  const { count } = await supabase.from("orders").select("id", { count: "exact", head: true });
  const order_number = `ALP-${1001 + (count ?? 0)}`;

  const paymentMethod: PaymentMethod = input.payment_method === "cod" ? "cod" : "card";
  const status = paymentMethod === "cod" ? "pending" : "paid";

  const { data: inserted, error } = await supabase
    .from("orders")
    .insert({
      order_number,
      status,
      user_id: user.id,
      customer_email,
      customer_name,
      shipping_address: input.shipping_address,
      line_items: input.line_items,
      subtotal: input.subtotal,
      shipping_cost: input.shipping_cost,
      total: input.total,
      payment_method: paymentMethod,
    })
    .select("id, order_number")
    .single();

  if (error) {
    return { error: error.message };
  }

  const orderedOk = await applyOrderInventoryChanges(input.line_items);
  if (!orderedOk) {
    await deleteOrderById(inserted.id);
    return {
      error:
        "We couldn’t finalize your order. Please refresh the page and try again.",
    };
  }

  for (const line of input.line_items) {
    const pid = line.productId?.trim();
    if (pid && PRODUCT_ID_UUID.test(pid)) {
      revalidatePath(`/product/${pid}`);
    }
  }
  revalidatePath("/admin/products");
  revalidatePath("/");

  void sendOrderConfirmationEmail({
    orderNumber: inserted.order_number,
    orderId: inserted.id,
    customerEmail: customer_email,
    customerName: customer_name,
    input: {
      line_items: input.line_items,
      subtotal: input.subtotal,
      shipping_cost: input.shipping_cost,
      total: input.total,
      shipping_address: input.shipping_address,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/account");
  revalidatePath(`/account/orders/${inserted.id}`);
  return { order_number: inserted.order_number, order_id: inserted.id };
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
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/account");
  revalidatePath(`/account/orders/${id}`);
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
  payment_method?: PaymentMethod | string;
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

export type CustomerOrderSummary = {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total: number;
  /** Included so order history can show thumbnails (newer orders include `image` on lines) */
  line_items?: OrderLineItem[];
};

/** Orders for the currently signed-in customer (same email as account). */
export async function getMyOrders(): Promise<CustomerOrderSummary[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return [];

  const email = user.email.trim().toLowerCase();
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, created_at, status, total, line_items")
    .eq("customer_email", email)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as CustomerOrderSummary[];
}

/** Single order for customer if it belongs to their email. */
export async function getCustomerOrderById(id: string): Promise<OrderDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const email = user.email.trim().toLowerCase();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("customer_email", email)
    .single();

  if (error || !data) return null;
  return data as OrderDetail;
}
