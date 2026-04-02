import type { ProductRow } from "@/lib/products-db";
import { priceForFit, type ProductFit } from "@/lib/types";

export type AdminOrderProduct = {
  id: string;
  name: string;
  /** SKU / item code from catalog (searchable). */
  itemCode: string;
  /** Regular fit price */
  price: number;
  priceOversize: number | null;
  image: string;
  sizes: string[];
  fits: ProductFit[];
  colors: string[];
};

function parseFitsFromRow(raw: unknown, legacyFit: string | null): ProductFit[] {
  const fits: ProductFit[] = [];
  if (Array.isArray(raw)) {
    for (const x of raw) {
      if (x === "Regular" || x === "Oversize") fits.push(x);
    }
  }
  if (fits.length === 0 && (legacyFit === "Regular" || legacyFit === "Oversize")) {
    fits.push(legacyFit);
  }
  return [...new Set(fits)];
}

/** Map DB rows to the shape used by admin order line pickers. */
export function productRowsToAdminOrderProducts(rows: ProductRow[]): AdminOrderProduct[] {
  return rows.map((row) => {
    const fits = parseFitsFromRow(row.fits, row.fit ?? null);
    const price = Number(row.price) || 0;
    const rawPo = row.price_oversize;
    const priceOversize =
      rawPo != null && Number.isFinite(Number(rawPo)) ? Number(rawPo) : null;
    return {
      id: row.id,
      name: row.name,
      itemCode: String(row.item_code ?? "").trim(),
      price,
      priceOversize,
      image: row.image,
      sizes: Array.isArray(row.sizes) && row.sizes.length > 0 ? row.sizes : ["M"],
      fits,
      colors: Array.isArray(row.colors) ? row.colors : [],
    };
  });
}

/** Filter catalog rows for order line pickers (name, item code, price, Rs. prefix, plain digits). */
export function filterAdminProductsForSearch(products: AdminOrderProduct[], query: string): AdminOrderProduct[] {
  const raw = query.trim();
  if (!raw) return products;
  const q = raw.toLowerCase();
  const priceNorm = raw.replace(/^rs\.?\s*/i, "").replace(/,/g, "").trim();
  const asNumber = priceNorm !== "" && !Number.isNaN(Number(priceNorm)) ? Number(priceNorm) : null;
  const digitsOnly = q.replace(/\D/g, "");

  return products.filter((p) => {
    if (p.name.toLowerCase().includes(q)) return true;
    if (p.itemCode && p.itemCode.toLowerCase().includes(q)) return true;
    const reg = Number(p.price);
    const po = p.priceOversize;
    if (!Number.isFinite(reg)) return false;
    if (asNumber !== null) {
      if (Math.abs(reg - asNumber) < 0.005) return true;
      if (po != null && Number.isFinite(po) && Math.abs(po - asNumber) < 0.005) return true;
    }
    if (digitsOnly.length >= 2) {
      for (const price of [reg, ...(po != null && Number.isFinite(po) ? [po] : [])]) {
        const intPart = String(Math.floor(price));
        const dec = price.toFixed(2).replace(".", "");
        if (intPart.includes(digitsOnly) || dec.includes(digitsOnly)) return true;
      }
    }
    const label = `rs. ${reg.toFixed(2)}`.toLowerCase();
    if (label.includes(q)) return true;
    if (po != null && Number.isFinite(po)) {
      const labelO = `rs. ${po.toFixed(2)}`.toLowerCase();
      if (labelO.includes(q)) return true;
    }
    return false;
  });
}

/** Unit price for an admin order line from catalog + selected fit. */
export function adminUnitPriceForProduct(p: AdminOrderProduct, fit?: string | null): number {
  const f = fit === "Oversize" || fit === "Regular" ? fit : undefined;
  return priceForFit({ price: p.price, priceOversize: p.priceOversize }, f);
}

/** Label for selects and search results (includes item code when set). */
export function formatAdminProductPickerLabel(p: AdminOrderProduct): string {
  const code = p.itemCode ? ` [${p.itemCode}]` : "";
  const reg = Number(p.price);
  const po = p.priceOversize;
  if (po != null && Number.isFinite(po) && Math.abs(po - reg) > 0.005) {
    return `${p.name}${code} — Reg Rs. ${reg.toFixed(2)} / Oversize Rs. ${po.toFixed(2)}`;
  }
  return `${p.name}${code} — Rs. ${reg.toFixed(2)}`;
}
