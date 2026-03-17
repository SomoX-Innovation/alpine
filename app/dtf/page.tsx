import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getDtfItems } from "@/lib/settings-db";
import { DtfGrid } from "@/components/DtfGrid";

export const metadata = {
  title: "DTF — Alpine",
  description: "Shop DTF (Direct to Film) prints. Durable, vibrant designs on quality apparel.",
};

export default async function DTFPage() {
  const dtfItems = await getDtfItems();
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {dtfItems.length > 0 && <DtfGrid items={dtfItems} />}
      </main>
      <Footer />
    </div>
  );
}
