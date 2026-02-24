import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutContent from "@/components/CheckoutContent";

export const metadata = {
  title: "Checkout — Alpine",
  description: "Complete your order.",
};

export default function CheckoutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <CheckoutContent />
      </main>
      <Footer />
    </div>
  );
}
