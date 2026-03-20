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
  /** Filter-only category: Oversize or Regular */
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

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
};
