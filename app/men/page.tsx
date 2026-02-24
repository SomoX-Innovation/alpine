import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CollectionLayout from "@/components/CollectionLayout";
import { getProductsByCategory } from "@/lib/products-db";
import { getProductsByCategory as getStaticByCategory } from "@/lib/products";

export const metadata = {
  title: "Men — Alpine",
  description: "Shop men's clothing. Shirts, outerwear and more.",
};

export default async function MenPage() {
  let products = await getProductsByCategory("Men");
  if (products.length === 0) products = getStaticByCategory("Men");
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <CollectionLayout
          title="Men"
          description="Clothing for him. Shirts, outerwear and more."
          products={products}
        />
      </main>
      <Footer />
    </div>
  );
}
