import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CollectionLayout from "@/components/CollectionLayout";
import { getSaleProducts } from "@/lib/products-db";
import { getSaleProducts as getStaticSaleProducts } from "@/lib/products";

export const metadata = {
  title: "Sale — Alpine",
  description: "Save on selected items. Limited time.",
};

export default async function SalePage() {
  let products = await getSaleProducts();
  if (products.length === 0) products = getStaticSaleProducts();
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <CollectionLayout
          title="Sale"
          description="Save on selected items. Limited time."
          products={products}
        />
      </main>
      <Footer />
    </div>
  );
}
