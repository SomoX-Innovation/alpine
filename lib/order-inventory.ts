import { createServiceRoleClient } from "@/lib/supabase-service";
import { variantInventoryKey } from "@/lib/types";

const PRODUCT_ID_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type InventoryLineLike = {
  productId?: string;
  quantity?: number;
  fit?: string;
  size?: string;
  color?: string;
};

/** Total units per product id (ordered counts only). */
export function aggregateNeedByProduct(lineItems: InventoryLineLike[]): Map<string, number> {
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

/**
 * Merge cart lines by product + fit + size + color for stock checks.
 */
export function aggregateNeedByVariant(
  lineItems: InventoryLineLike[]
): Map<string, { productId: string; qty: number; fit: string; size: string; color: string }> {
  const map = new Map<string, { productId: string; qty: number; fit: string; size: string; color: string }>();
  for (const line of lineItems) {
    const pid = line.productId?.trim();
    if (!pid || !PRODUCT_ID_UUID.test(pid)) continue;
    const q = Math.max(0, Math.floor(Number(line.quantity)) || 0);
    if (q <= 0) continue;
    const fit = line.fit ?? "";
    const size = line.size ?? "";
    const color = line.color ?? "";
    const vk = variantInventoryKey(fit || undefined, size, color || undefined);
    const key = `${pid}|${vk}`;
    const prev = map.get(key);
    if (prev) {
      prev.qty += q;
    } else {
      map.set(key, { productId: pid, qty: q, fit, size, color });
    }
  }
  return map;
}

export type InventoryRpcLine = {
  product_id: string;
  qty: number;
  fit: string;
  size: string;
  color: string;
};

export function lineItemsToInventoryRpcPayload(lineItems: InventoryLineLike[]): InventoryRpcLine[] {
  const out: InventoryRpcLine[] = [];
  for (const line of lineItems) {
    const pid = line.productId?.trim();
    if (!pid || !PRODUCT_ID_UUID.test(pid)) continue;
    const q = Math.max(0, Math.floor(Number(line.quantity)) || 0);
    if (q <= 0) continue;
    out.push({
      product_id: pid,
      qty: q,
      fit: line.fit ?? "",
      size: line.size ?? "",
      color: line.color ?? "",
    });
  }
  return out;
}

/**
 * Updates ordered counts; when track_stock, decrements variant_stock or legacy quantity. Requires service role.
 */
export async function applyOrderInventoryFromLines(
  lineItems: InventoryLineLike[]
): Promise<{ ok: true } | { ok: false; insufficientStock: boolean; message: string }> {
  const svc = createServiceRoleClient();
  if (!svc) {
    console.warn(
      "[inventory] SUPABASE_SERVICE_ROLE_KEY missing — stock and ordered counts not updated."
    );
    return { ok: true };
  }
  const payload = lineItemsToInventoryRpcPayload(lineItems);
  if (payload.length === 0) {
    return { ok: true };
  }
  const { error } = await svc.rpc("apply_order_inventory_changes", {
    p_lines: payload,
  });
  if (error) {
    const msg = error.message || "";
    const insufficient =
      msg.toLowerCase().includes("insufficient_stock") ||
      msg.toLowerCase().includes("insufficient stock");
    console.error("[inventory] apply_order_inventory_changes", msg);
    return { ok: false, insufficientStock: insufficient, message: msg };
  }
  return { ok: true };
}
