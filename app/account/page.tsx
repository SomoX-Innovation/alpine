import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountContent from "@/components/AccountContent";
import { createClient } from "@/lib/supabase-server";

export const metadata = {
  title: "Account — Alpine",
  description: "Manage your account and orders.",
};

export default async function AccountPage() {
  let userEmail: string | null = null;
  let userConfirmed = false;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
    userConfirmed = Boolean((user as any)?.confirmed_at);
  } catch {
    // If auth isn't configured, keep the account page in logged-out mode.
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <AccountContent userEmail={userEmail} userConfirmed={userConfirmed} />
      </main>
      <Footer />
    </div>
  );
}
