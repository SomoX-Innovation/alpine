import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FaqContent from "@/components/FaqContent";
import { getFaqData } from "@/lib/settings-db";

export const metadata = {
  title: "FAQ — Alpine",
  description: "Frequently asked questions.",
};

export default async function FaqPage() {
  const faqs = await getFaqData();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-semibold text-[var(--foreground)]">
            Frequently asked questions
          </h1>
          <FaqContent initialFaqs={faqs} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
