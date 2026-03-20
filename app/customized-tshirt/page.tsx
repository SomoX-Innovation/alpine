import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CustomizedTShirtContent from "@/components/CustomizedTShirtContent";

export const metadata = {
  title: "Customized T Shirt — Alpine",
  description: "Upload DTF designs and place custom t-shirt orders.",
};

export default function CustomizedTShirtPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <CustomizedTShirtContent />
      </main>
      <Footer />
    </div>
  );
}
