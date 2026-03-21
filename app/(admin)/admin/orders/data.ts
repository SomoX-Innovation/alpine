import type { SupabaseClient } from "@supabase/supabase-js";

export const ORDER_STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatusFilter = (typeof ORDER_STATUSES)[number] | "all";

export type AdminOrderRow = {
  id: string;
  order_number: string;
  created_at: string;
  customer_email: string;
  customer_name: string;
  total: number;
  status: string;
  payment_method: string;
};

function sanitizeSearch(q: string): string {
  return q.trim().slice(0, 120).replace(/%/g, "").replace(/_/g, "");
}

export async function fetchAdminOrders(
  supabase: SupabaseClient,
  opts: { status?: string; q?: string }
): Promise<AdminOrderRow[]> {
  const status =
    opts.status && ORDER_STATUSES.includes(opts.status as (typeof ORDER_STATUSES)[number])
      ? opts.status
      : undefined;
  const q = sanitizeSearch(opts.q ?? "");

  let query = supabase
    .from("orders")
    .select("id, order_number, created_at, customer_email, customer_name, total, status, payment_method")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  if (q.length > 0) {
    const term = `%${q}%`;
    query = query.or(
      `order_number.ilike.${term},customer_email.ilike.${term},customer_name.ilike.${term}`
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("[admin/orders]", error.message);
    return [];
  }
  return (data ?? []) as AdminOrderRow[];
}

export async function fetchOrderStats(supabase: SupabaseClient): Promise<{
  total: number;
  byStatus: Record<(typeof ORDER_STATUSES)[number], number>;
}> {
  const totalRes = await supabase.from("orders").select("id", { count: "exact", head: true });

  const byStatusEntries = await Promise.all(
    ORDER_STATUSES.map(async (s) => {
      const { count } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", s);
      return [s, count ?? 0] as const;
    })
  );

  const byStatus = Object.fromEntries(byStatusEntries) as Record<
    (typeof ORDER_STATUSES)[number],
    number
  >;

  return {
    total: totalRes.count ?? 0,
    byStatus,
  };
}
