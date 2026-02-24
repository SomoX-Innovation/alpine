export type ProductCategory = "Women" | "Men" | "Unisex";

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
  description: string;
  sizes: string[];
  /** Color / shade, e.g. Black, White, Heather Grey */
  color?: string;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
};
