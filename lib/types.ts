import { CURRENCY } from "@/lib/currency";

export type ProductCategory = "Women" | "Men" | "Unisex" | "DTF";

/** Filter-only (not in nav): Oversize, Regular */
export type ProductFit = "Oversize" | "Regular";

/** Regular uses `price`; Oversize uses `priceOversize` when set, else same as regular. */
export type ProductPricing = {
  price: number;
  priceOversize?: number | null;
};

export function priceForFit(pricing: ProductPricing, fit?: ProductFit | null): number {
  const regular = Number(pricing.price) || 0;
  if (fit === "Oversize") {
    const po = pricing.priceOversize;
    if (po != null && Number.isFinite(Number(po))) return Number(po);
  }
  return regular;
}

export function formatPriceForFit(pricing: ProductPricing, fit?: ProductFit | null): string {
  return CURRENCY.format(priceForFit(pricing, fit));
}

export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  priceFormatted: string;
  /** When set, Oversize fit uses this price; Regular always uses `price`. */
  priceOversize?: number | null;
  compareAtPrice?: number;
  category: ProductCategory;
  image: string;
  images: string[];
  badge?: "New" | "Sale";
  /** Which fits this product is available in (storefront filter + PDP). Same color images apply to all selected fits. */
  fits: ProductFit[];
  /** @deprecated Use `fits`; kept for legacy rows / single-fit display */
  fit?: ProductFit;
  description: string;
  itemCode?: string;
  sizes: string[];
  /** Colors / shades, e.g. ["Black", "White", "Heather Grey"] */
  colors: string[];
  /** Optional image per color name, e.g. { Black: "https://..." } */
  colorImages?: Record<string, string>;
  /** Cumulative units ordered by customers (all-time); from DB */
  orderedQuantity?: number;
  /** When true, `stockQuantity` is enforced on checkout and shown on the store */
  trackStock?: boolean;
  /** Legacy pooled units (DB `quantity`) when `trackStock` and no per-variant map */
  stockQuantity?: number;
  /** Per-variant counts keyed as `fit|size|color` (see `variantInventoryKey`) */
  variantStock?: Record<string, number>;
};

/** Parse DB `variant_stock` jsonb into a numeric map (missing keys = 0 at read time). */
export function parseVariantStockRecord(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof k !== "string" || !k.trim()) continue;
    out[k] = Math.max(0, Math.floor(Number(v) || 0));
  }
  return out;
}

/** Stable key: Regular|Oversize, `_` if fit not applicable; same for empty color. */
export function variantInventoryKey(
  fit: string | null | undefined,
  size: string,
  color: string | null | undefined
): string {
  const f = fit === "Oversize" || fit === "Regular" ? fit : "_";
  const s = (size || "").trim() || "_";
  const c = (color ?? "").trim() || "_";
  return `${f}|${s}|${c}`;
}

export type ProductStockPick = Pick<Product, "trackStock" | "stockQuantity" | "variantStock">;

/** Available units for one cart line (variant row, or legacy pool if map is empty). */
export function getVariantStockQuantity(
  product: ProductStockPick,
  opts: { fit?: string | null; size: string; color?: string | null }
): number {
  if (!product.trackStock) return 99;
  const vs = product.variantStock;
  const key = variantInventoryKey(opts.fit, opts.size, opts.color);
  if (vs && typeof vs === "object" && Object.keys(vs).length > 0) {
    return Math.max(0, Math.floor(Number((vs as Record<string, unknown>)[key]) || 0));
  }
  return Math.max(0, Math.floor(Number(product.stockQuantity) || 0));
}

/** Max units per line (cap 99 vs available). */
export function effectiveMaxCartQuantityForLine(
  product: ProductStockPick,
  opts: { fit?: string | null; size: string; color?: string | null }
): number {
  const cap = 99;
  if (!product.trackStock) return cap;
  return Math.min(cap, getVariantStockQuantity(product, opts));
}

/** Any sellable variant (or legacy pool) has stock > 0. */
export function productHasAnyStock(product: Product): boolean {
  if (!product.trackStock) return true;
  const vs = product.variantStock;
  if (vs && typeof vs === "object" && Object.keys(vs).length > 0) {
    return Object.values(vs).some((v) => Math.floor(Number(v) || 0) > 0);
  }
  return Math.floor(Number(product.stockQuantity) || 0) > 0;
}

export function isProductVariantOutOfStock(
  product: Product,
  opts: { fit?: string | null; size: string; color?: string | null }
): boolean {
  return product.trackStock === true && effectiveMaxCartQuantityForLine(product, opts) <= 0;
}

/** Listing / card: true when tracking stock and no variant (or legacy pool) has units left. */
export function isProductOutOfStock(product: Product): boolean {
  return product.trackStock === true && !productHasAnyStock(product);
}

/** Fits for filtering / PDP (handles legacy `fit` when `fits` is empty). */
export function productFitList(product: Product): ProductFit[] {
  if (product.fits.length > 0) return product.fits;
  if (product.fit) return [product.fit];
  return [];
}

export type CartItem = {
  productId: string;
  name: string;
  /** Regular (list) price from catalog */
  price: number;
  /**
   * Oversize price when set on the product. Omitted in older localStorage carts — then `price` is treated as the stored unit price.
   */
  priceOversize?: number | null;
  image: string;
  size: string;
  quantity: number;
  /** When product offers multiple fits, line is keyed by size + fit */
  fit?: ProductFit;
  /** Selected color name when product has colors */
  color?: string;
  /** When set (stock-tracked product), line quantity must not exceed this */
  maxQuantity?: number;
};

/** Unit price for a cart line (handles Regular vs Oversize when `priceOversize` is present). */
export function cartLineUnitPrice(item: CartItem): number {
  if (item.priceOversize === undefined) {
    return Number(item.price) || 0;
  }
  return priceForFit(
    { price: item.price, priceOversize: item.priceOversize },
    item.fit
  );
}
