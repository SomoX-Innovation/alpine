import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountContent from "@/components/AccountContent";

export const metadata = {
  title: "Account — Alpine",
  description: "Manage your account and orders.",
};

export default function AccountPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <AccountContent />
      </main>
      <Footer />
    </div>
  );
}
