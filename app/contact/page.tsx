import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact — Alpine",
  description: "Get in touch with us.",
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-semibold text-[var(--foreground)]">
            Contact us
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            Have a question or feedback? Send us a message.
          </p>
          <ContactForm />
          <div className="mt-10 border-t border-[var(--border)] pt-8">
            <p className="text-sm font-medium text-[var(--foreground)]">
              Customer service
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              support@alpine.example.com
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Mon–Fri, 9am–6pm CET
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
