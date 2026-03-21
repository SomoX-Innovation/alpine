import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutContent from "@/components/CheckoutContent";
import { createClient } from "@/lib/supabase-server";
import { getCustomerProfile } from "@/app/actions/account";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Checkout — Alpine",
  description: "Complete your order.",
};

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login?redirect=/checkout");
  }

  const profile = await getCustomerProfile();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <CheckoutContent userEmail={user.email} savedProfile={profile} />
      </main>
      <Footer />
    </div>
  );
}
