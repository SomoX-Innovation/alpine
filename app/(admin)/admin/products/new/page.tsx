import Link from "next/link";
import { getCategories } from "@/lib/categories-db";
import { getColors } from "@/lib/colors-db";
import NewProductForm from "../components/NewProductForm";

export default async function NewProductPage() {
  const categories = await getCategories();
  const colors = await getColors();

  return (
    <div>
      <Link
        href="/admin/products"
        className="text-sm text-[var(--accent)] hover:underline"
      >
        ← Products
      </Link>
      <h1 className="mt-4 font-display text-2xl font-semibold text-[var(--foreground)]">
        New product
      </h1>
      <NewProductForm categories={categories} colors={colors} />
    </div>
  );
}
