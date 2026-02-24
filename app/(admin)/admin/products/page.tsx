import Link from "next/link";
import { getAllProducts } from "@/lib/products-db";

export default async function AdminProductsPage() {
  const products = await getAllProducts(true);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
          Products
        </h1>
        <Link
          href="/admin/products/new"
          className="rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] hover:bg-[var(--accent)]"
        >
          Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="mt-8 text-[var(--muted)]">
          No products yet. Add one to get started.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted-bg)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--foreground)]">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-[var(--foreground)]">
                  Category
                </th>
                <th className="px-4 py-3 text-left font-medium text-[var(--foreground)]">
                  Price
                </th>
                <th className="px-4 py-3 text-left font-medium text-[var(--foreground)]">
                  Badge
                </th>
                <th className="px-4 py-3 text-left font-medium text-[var(--foreground)]">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-[var(--foreground)]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                    {p.name}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{p.category}</td>
                  <td className="px-4 py-3 text-[var(--foreground)]">
                    €{Number(p.price).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {p.badge ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {p.published ? "Published" : "Draft"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="text-[var(--accent)] hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
