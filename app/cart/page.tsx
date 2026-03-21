import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartContent from "@/components/CartContent";
import { createClient } from "@/lib/supabase-server";

export const metadata = {
  title: "Cart — Alpine",
  description: "Your shopping cart.",
};

export default async function CartPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <CartContent isSignedIn={Boolean(user)} />
      </main>
      <Footer />
    </div>
  );
}
