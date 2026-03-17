"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateProduct, deleteProduct, uploadProductImage } from "../../actions/products";
import type { ProductRow } from "@/lib/products-db";
import type { CategoryRow } from "@/lib/categories-db";
import type { ColorRow } from "@/lib/colors-db";

export default function EditProductForm({ product, categories = [], colors = [] }: { product: ProductRow, categories: CategoryRow[], colors: ColorRow[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState(product.image);
  const [uploading, setUploading] = useState(false);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadProductImage(formData);
    setUploading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.url) setImageUrl(result.url);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("image", imageUrl);
    const result = await updateProduct(product.id, formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setError(null);
    const result = await deleteProduct(product.id);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <>
      <Link
        href="/admin/products"
        className="text-sm text-[var(--accent)] hover:underline"
      >
        ← Products
      </Link>
      <h1 className="mt-4 font-display text-2xl font-semibold text-[var(--foreground)]">
        Edit product
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-6">
        {error && (
          <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {error}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Name *
          </label>
          <input
            name="name"
            type="text"
            required
            defaultValue={product.name}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Slug *
          </label>
          <input
            name="slug"
            type="text"
            required
            defaultValue={product.slug}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Item Code (optional)
          </label>
          <input
            name="item_code"
            type="text"
            defaultValue={product.item_code ?? ""}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Description
          </label>
          <textarea
            name="description"
            rows={3}
            defaultValue={product.description}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Price (Rs.) *
            </label>
            <input
              name="price"
              type="number"
              required
              min="0"
              step="0.01"
              defaultValue={product.price}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Compare at price (Rs.)
            </label>
            <input
              name="compare_at_price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product.compare_at_price ?? ""}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Category
            </label>
            <select
              name="category"
              defaultValue={product.category}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Badge
            </label>
            <select
              name="badge"
              defaultValue={product.badge ?? ""}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            >
              <option value="">None</option>
              <option value="New">New</option>
              <option value="Sale">Sale</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Fit (for filtering only)
            </label>
            <select
              name="fit"
              defaultValue={product.fit ?? ""}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            >
              <option value="">—</option>
              <option value="Oversize">Oversize</option>
              <option value="Regular">Regular</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Colors
          </label>
          <div className="flex flex-wrap gap-4">
            {colors.map((c) => (
              <label key={c.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="colors"
                  value={c.name}
                  defaultChecked={product.colors?.includes(c.name)}
                  className="rounded border-[var(--border)]"
                />
                <span className="text-sm text-[var(--foreground)]">{c.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Sizes (comma-separated)
          </label>
          <input
            name="sizes"
            type="text"
            defaultValue={Array.isArray(product.sizes) ? product.sizes.join(", ") : "S,M,L,XL,XXL"}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Quantity (stock)
          </label>
          <input
            name="quantity"
            type="number"
            min="0"
            defaultValue={product.quantity ?? 0}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Main image URL (or upload new)
          </label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            placeholder="https://..."
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={uploading}
            className="mt-2 block w-full text-sm text-[var(--muted)]"
          />
          {uploading && (
            <p className="mt-1 text-sm text-[var(--muted)]">Uploading…</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="published"
            id="published"
            defaultChecked={product.published}
            className="rounded border-[var(--border)]"
          />
          <label htmlFor="published" className="text-sm text-[var(--foreground)]">
            Published (visible on store)
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="rounded-md bg-[var(--foreground)] px-4 py-2.5 text-sm font-medium text-[var(--background)] hover:bg-[var(--accent)]"
          >
            Save changes
          </button>
          <Link
            href="/admin/products"
            className="rounded-md border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-md border border-red-500/50 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10"
          >
            Delete
          </button>
        </div>
      </form>
    </>
  );
}
