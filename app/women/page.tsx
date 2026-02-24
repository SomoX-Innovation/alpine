import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CollectionLayout from "@/components/CollectionLayout";
import { getProductsByCategory } from "@/lib/products-db";
import { getProductsByCategory as getStaticByCategory } from "@/lib/products";

export const metadata = {
  title: "Women — Alpine",
  description: "Shop women's clothing. Dresses, tops, outerwear and more.",
};

export default async function WomenPage() {
  let products = await getProductsByCategory("Women");
  if (products.length === 0) products = getStaticByCategory("Women");
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <CollectionLayout
          title="Women"
          description="Clothing for her. Dresses, tops, outerwear and more."
          products={products}
        />
      </main>
      <Footer />
    </div>
  );
}
