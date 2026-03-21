import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountContent from "@/components/AccountContent";
import { createClient } from "@/lib/supabase-server";
import { getMyOrders } from "@/app/actions/orders";
import { getCustomerProfile } from "@/app/actions/account";

export const metadata = {
  title: "Account — Alpine",
  description: "Manage your account and orders.",
};

export default async function AccountPage() {
  let userEmail: string | null = null;
  let userConfirmed = false;
  let orders: Awaited<ReturnType<typeof getMyOrders>> = [];
  let profile: Awaited<ReturnType<typeof getCustomerProfile>> = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
    userConfirmed = Boolean((user as any)?.confirmed_at);
    if (user) {
      orders = await getMyOrders();
      profile = await getCustomerProfile();
    }
  } catch {
    // If auth isn't configured, keep the account page in logged-out mode.
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <AccountContent
          userEmail={userEmail}
          userConfirmed={userConfirmed}
          orders={orders}
          profile={profile}
        />
      </main>
      <Footer />
    </div>
  );
}
