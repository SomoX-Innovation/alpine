import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createServiceRoleClient } from "@/lib/supabase-service";
import { isUserInAdminTable } from "@/lib/admin-auth";

const MISSING_INVOICE_COLUMN_HELP =
  "Database schema is missing orders.invoice_path. Run: alter table public.orders add column if not exists invoice_path text;";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = await isUserInAdminTable(supabase, user.id);

  // Customer can only access their own order; admin can access any.
  const baseQuery = supabase.from("orders").select("id, customer_email, invoice_path");
  const { data: order, error } = isAdmin
    ? await baseQuery.eq("id", orderId).single()
    : await baseQuery
        .eq("id", orderId)
        .eq("customer_email", user.email?.trim().toLowerCase() || "")
        .single();

  if (error || !order) {
    const msg = String(error?.message || "");
    if (msg.toLowerCase().includes("invoice_path") && msg.toLowerCase().includes("schema cache")) {
      return NextResponse.json({ error: MISSING_INVOICE_COLUMN_HELP }, { status: 500 });
    }
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (!order.invoice_path) {
    return NextResponse.json({ error: "Invoice not generated yet" }, { status: 404 });
  }

  const svc = createServiceRoleClient();
  if (!svc) {
    return NextResponse.json(
      { error: "Invoice service not configured" },
      { status: 500 }
    );
  }

  const bucket = "invoices";
  const signed = await svc.storage
    .from(bucket)
    .createSignedUrl(order.invoice_path, 60);

  if (signed.error || !signed.data?.signedUrl) {
    return NextResponse.json({ error: signed.error?.message || "Failed to sign URL" }, { status: 500 });
  }

  return NextResponse.redirect(signed.data.signedUrl);
}

