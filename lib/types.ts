export type ProductCategory = "Women" | "Men" | "Unisex" | "DTF";

/** Filter-only (not in nav): Oversize, Regular */
export type ProductFit = "Oversize" | "Regular";

export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  priceFormatted: string;
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
  /** Stock quantity (0 = out of stock) */
  quantity: number;
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
  price: number;
  image: string;
  size: string;
  quantity: number;
  /** When product offers multiple fits, line is keyed by size + fit */
  fit?: ProductFit;
};
