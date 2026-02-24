import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CollectionLayout from "@/components/CollectionLayout";
import { getNewArrivals } from "@/lib/products-db";
import { getNewArrivals as getStaticNewArrivals } from "@/lib/products";

export const metadata = {
  title: "New Designs — Alpine",
  description: "Latest DTF print t-shirt drops.",
};

export default async function NewArrivalsPage() {
  let products = await getNewArrivals();
  if (products.length === 0) products = getStaticNewArrivals();
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <CollectionLayout
          title="New Designs"
          description="Fresh DTF print drops. New graphics, same premium quality."
          products={products}
        />
      </main>
      <Footer />
    </div>
  );
}
