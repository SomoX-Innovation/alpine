"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase-service";
import { CURRENCY, SHIPPING_COUNTRY } from "@/lib/currency";
import { sendOrderPlacementEmails } from "@/lib/mail";
import { generateInvoicePdfBuffer } from "@/lib/invoice-pdf";
import { ensureInvoiceBucket, INVOICE_BUCKET } from "@/lib/invoice-storage";
import type { OrderLineItem, OrderDetail } from "@/app/actions/orders";
import { applyOrderInventoryFromLines } from "@/lib/order-inventory";

const MISSING_INVOICE_COLUMN_HELP =
  "Database schema is missing orders.invoice_path. Run: alter table public.orders add column if not exists invoice_path text;";

function isMissingInvoicePathColumnError(message?: string): boolean {
  const m = String(message || "").toLowerCase();
  return m.includes("invoice_path") && m.includes("schema cache");
}

function safeLineItems(items: OrderLineItem[]): OrderLineItem[] {
  return items
    .map((i) => ({
      productId: String(i.productId || "").trim(),
      name: String(i.name || "").trim(),
      size: String(i.size || "").trim(),
      quantity: Math.max(0, Math.floor(Number(i.quantity) || 0)),
      price: Number(i.price) || 0,
      ...(i.fit ? { fit: String(i.fit).trim() } : {}),
      ...(i.color ? { color: String(i.color).trim() } : {}),
      ...(i.image ? { image: String(i.image).trim() } : {}),
    }))
    .filter((i) => i.productId && i.name && i.size && i.quantity > 0 && i.price >= 0);
}

export async function createOrderAdmin(input: {
  customer_name: string;
  customer_email: string;
  shipping_address: { address: string; city: string; postalCode: string; country: string };
  line_items: OrderLineItem[];
}): Promise<{ order_id?: string; error?: string }> {
  const svc = createServiceRoleClient();
  if (!svc) return { error: "SUPABASE_SERVICE_ROLE_KEY missing (required for admin create order)." };

  const customer_email = String(input.customer_email || "").trim().toLowerCase();
  const customer_name = String(input.customer_name || "").trim() || "Customer";
  if (!customer_email.includes("@")) return { error: "Customer email is required." };

  const country = String(input.shipping_address?.country || "").trim() || SHIPPING_COUNTRY;
  if (country !== SHIPPING_COUNTRY) {
    return { error: `We only ship to ${SHIPPING_COUNTRY}.` };
  }

  const line_items = safeLineItems(input.line_items);
  if (line_items.length === 0) return { error: "At least one valid line item is required." };

  const subtotal = line_items.reduce((sum, i) => sum + (Number(i.price) || 0) * i.quantity, 0);
  const shipping_cost = subtotal >= CURRENCY.freeShippingThreshold ? 0 : CURRENCY.shippingCost;
  const total = subtotal + shipping_cost;

  const { count } = await svc.from("orders").select("id", { count: "exact", head: true });
  const order_number = `ALP-${1001 + (count ?? 0)}`;

  const { data: inserted, error } = await svc
    .from("orders")
    .insert({
      order_number,
      status: "pending",
      customer_email,
      customer_name,
      shipping_address: {
        address: String(input.shipping_address.address || "").trim(),
        city: String(input.shipping_address.city || "").trim(),
        postalCode: String(input.shipping_address.postalCode || "").trim(),
        country,
      },
      line_items,
      subtotal,
      shipping_cost,
      total,
      payment_method: "cod",
    })
    .select("id, order_number")
    .single();

  if (error || !inserted) return { error: error?.message || "Failed to create order." };

  const inv = await applyOrderInventoryFromLines(line_items);
  if (!inv.ok) {
    await svc.from("orders").delete().eq("id", inserted.id);
    return {
      error: inv.insufficientStock
        ? "Not enough stock for a product on this order. Reduce quantities or restock."
        : inv.message || "Could not update inventory for this order.",
    };
  }

  // Emails (if SMTP configured)
  try {
    await sendOrderPlacementEmails({
      orderNumber: inserted.order_number,
      orderId: inserted.id,
      customerEmail: customer_email,
      customerName: customer_name,
      input: {
        line_items,
        subtotal,
        shipping_cost,
        total,
        shipping_address: {
          address: String(input.shipping_address.address || "").trim(),
          city: String(input.shipping_address.city || "").trim(),
          postalCode: String(input.shipping_address.postalCode || "").trim(),
          country,
        },
      },
    });
  } catch (e) {
    console.error("[mail] sendOrderPlacementEmails (admin create):", e);
  }

  // Invoice
  try {
    const ensured = await ensureInvoiceBucket(svc);
    if (!ensured.ok) {
      console.error("[invoice] ensure bucket failed:", ensured.error);
    } else {
    const buffer = await generateInvoicePdfBuffer({
      id: inserted.id,
      order_number: inserted.order_number,
      status: "pending",
      customer_email,
      customer_name,
      shipping_address: {
        address: String(input.shipping_address.address || "").trim(),
        city: String(input.shipping_address.city || "").trim(),
        postalCode: String(input.shipping_address.postalCode || "").trim(),
        country,
      },
      line_items,
      subtotal,
      shipping_cost,
      total,
      payment_method: "cod",
      tracking_code: null,
      tracking_carrier: null,
      invoice_path: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as OrderDetail);

    const safeOrderNo = String(inserted.order_number ?? "order").replace(/[^a-zA-Z0-9-_]/g, "_");
    const invoicePath = `${safeOrderNo}.pdf`;
    const upload = await svc.storage.from(INVOICE_BUCKET).upload(invoicePath, buffer, {
      contentType: "application/pdf",
      upsert: true,
    });
    if (!upload.error) {
      const { error: upErr } = await svc
        .from("orders")
        .update({ invoice_path: invoicePath, updated_at: new Date().toISOString() })
        .eq("id", inserted.id);
      if (upErr) {
        if (isMissingInvoicePathColumnError(upErr.message)) {
          console.error("[invoice]", MISSING_INVOICE_COLUMN_HELP);
        } else {
          console.error("[invoice] update order failed:", upErr.message);
        }
      }
    } else {
      console.error("[invoice] upload failed:", upload.error.message);
    }
    }
  } catch (e) {
    console.error("[invoice] admin create invoice failed:", e);
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${inserted.id}`);
  return { order_id: inserted.id };
}

