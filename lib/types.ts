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
};

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
