import { notFound } from "next/navigation";
import { getProductRowById } from "@/lib/products-db";
import { getCategories } from "@/lib/categories-db";
import { getColors } from "@/lib/colors-db";
import EditProductForm from "../../components/EditProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductRowById(id);
  const categories = await getCategories();
  const colors = await getColors();

  if (!product) {
    notFound();
  }
  return (
    <div>
      <EditProductForm product={product} categories={categories} colors={colors} />
    </div>
  );
}
