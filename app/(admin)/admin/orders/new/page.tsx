import Link from "next/link";
import AdminCreateOrderForm from "../components/AdminCreateOrderForm";
import { getAllProducts } from "@/lib/products-db";
import { productRowsToAdminOrderProducts } from "@/lib/admin-order-product-search";

export default async function AdminCreateOrderPage() {
  const rows = await getAllProducts(false);
  const products = productRowsToAdminOrderProducts(rows);

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-[var(--accent)] hover:underline">
        ← Order management
      </Link>
      <h1 className="mt-4 font-display text-2xl font-semibold text-[var(--foreground)]">
        Create order
      </h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Create an order from admin. This will generate an invoice PDF and (if SMTP is configured) send emails.
      </p>
      <div className="mt-8">
        <AdminCreateOrderForm products={products} />
      </div>
    </div>
  );
}
