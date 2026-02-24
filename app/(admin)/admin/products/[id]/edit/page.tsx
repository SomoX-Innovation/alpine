import { notFound } from "next/navigation";
import { getProductRowById } from "@/lib/products-db";
import EditProductForm from "../../components/EditProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductRowById(id);
  if (!product) {
    notFound();
  }
  return (
    <div>
      <EditProductForm product={product} />
    </div>
  );
}
