import { NextResponse } from "next/server";
import { getProductById } from "@/lib/products-db";
import { productFitList } from "@/lib/types";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const product = await getProductById(id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: product.id,
    sizes: product.sizes,
    fits: productFitList(product),
    colors: product.colors ?? [],
    colorImages: product.colorImages ?? {},
    images: product.images ?? [],
    image: product.image,
    price: product.price,
    priceOversize: product.priceOversize ?? null,
  });
}
