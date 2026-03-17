import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CollectionLayout from "@/components/CollectionLayout";
import { getSaleProducts } from "@/lib/products-db";

export const metadata = {
  title: "Sale — Alpine",
  description: "Save on selected items. Limited time.",
};

export default async function SalePage() {
  const products = await getSaleProducts();
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
