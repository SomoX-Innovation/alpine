import { parseVariantStockRecord } from "@/lib/types";
import type { ProductRow } from "@/lib/products-db";

/** Inclusive: quantities 1..LOW_STOCK_MAX count as “low stock”. */
export const LOW_STOCK_MAX = 5;

export type StockProductInput = Pick<ProductRow, "track_stock" | "quantity" | "variant_stock">;

export function formatVariantLabel(key: string): string {
  const [f, s, c] = key.split("|");
  const parts: string[] = [];
  if (f !== "_") parts.push(f);
  parts.push(s === "_" ? "Size —" : `Size ${s}`);
  if (c !== "_") parts.push(c);
  return parts.join(" · ");
}

export type AnalyzedTrackedStock = {
  mode: "pooled" | "variant";
  totalUnits: number;
  lineCount: number;
  minOnHand: number;
  lowLines: number;
  lines: { label: string; qty: number }[];
};

export function analyzeTrackedStock(row: StockProductInput): AnalyzedTrackedStock | null {
  if (row.track_stock !== true) return null;
  const vs = parseVariantStockRecord(row.variant_stock);
  const entries = Object.entries(vs);

  if (entries.length === 0) {
    const q = Math.max(0, Math.floor(Number(row.quantity) || 0));
    return {
      mode: "pooled",
      totalUnits: q,
      lineCount: 1,
      minOnHand: q,
      lowLines: q > 0 && q <= LOW_STOCK_MAX ? 1 : 0,
      lines: [{ label: "Pooled (all variants share this count)", qty: q }],
    };
  }

  const lines = entries
    .map(([k, v]) => ({
      label: formatVariantLabel(k),
      qty: Math.max(0, Math.floor(Number(v) || 0)),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const totalUnits = lines.reduce((s, l) => s + l.qty, 0);
  const quantities = lines.map((l) => l.qty);
  const minOnHand = quantities.length ? Math.min(...quantities) : 0;
  const lowLines = lines.filter((l) => l.qty > 0 && l.qty <= LOW_STOCK_MAX).length;

  return {
    mode: "variant",
    totalUnits,
    lineCount: lines.length,
    minOnHand,
    lowLines,
    lines,
  };
}

export type StockStatus = "out" | "low" | "ok";

export function stockStatusForAnalysis(a: AnalyzedTrackedStock): StockStatus {
  if (a.totalUnits <= 0) return "out";
  if (a.lowLines > 0 || (a.minOnHand > 0 && a.minOnHand <= LOW_STOCK_MAX)) return "low";
  return "ok";
}

/** Sort: out → low → ok, then by name. */
export function stockDashboardSortKey(
  name: string,
  a: AnalyzedTrackedStock | null
): [number, string] {
  if (!a) return [4, name];
  const s = stockStatusForAnalysis(a);
  const tier = s === "out" ? 0 : s === "low" ? 1 : 2;
  return [tier, name.toLowerCase()];
}

export function stockHomeSummary(rows: StockProductInput[]) {
  let trackedProducts = 0;
  let totalUnits = 0;
  let needAttention = 0;
  for (const row of rows) {
    const a = analyzeTrackedStock(row);
    if (!a) continue;
    trackedProducts++;
    totalUnits += a.totalUnits;
    if (stockStatusForAnalysis(a) !== "ok") needAttention++;
  }
  const notTracked = rows.filter((r) => r.track_stock !== true).length;
  return { trackedProducts, totalUnits, needAttention, notTracked };
}
