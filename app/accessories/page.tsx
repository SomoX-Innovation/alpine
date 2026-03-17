import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CollectionLayout from "@/components/CollectionLayout";
import { getProductsByCategory } from "@/lib/products-db";

export const metadata = {
  title: "Accessories — Alpine",
  description: "Unisex accessories and more for everyone.",
};

export default async function UnisexPage() {
  const products = await getProductsByCategory("Unisex");
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <CollectionLayout
          title="Accessories"
          description="Unisex accessories and more for everyone."
          products={products}
        />
      </main>
      <Footer />
    </div>
  );
}
