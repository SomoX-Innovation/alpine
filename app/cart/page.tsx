import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartContent from "@/components/CartContent";

export const metadata = {
  title: "Cart — Alpine",
  description: "Your shopping cart.",
};

export default function CartPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <CartContent />
      </main>
      <Footer />
    </div>
  );
}
