import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CollectionLayout from "@/components/CollectionLayout";
import { getNewArrivals } from "@/lib/products-db";

export const metadata = {
  title: "New Designs — Alpine",
  description: "Latest drops: new badge items and products added in the last 30 days.",
};

export default async function NewArrivalsPage() {
  const products = await getNewArrivals();
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <CollectionLayout
          title="New Designs"
          description="Fresh DTF print drops — tagged New, or added in the last 30 days."
          products={products}
        />
      </main>
      <Footer />
    </div>
  );
}
