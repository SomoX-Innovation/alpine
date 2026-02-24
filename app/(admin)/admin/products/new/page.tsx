"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createProduct } from "../../actions/products";
import { uploadProductImage } from "../../actions/products";

export default function NewProductPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
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
    const result = await createProduct(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.id) {
      router.push("/admin/products");
      router.refresh();
    }
  }

  return (
    <div>
      <Link
        href="/admin/products"
        className="text-sm text-[var(--accent)] hover:underline"
      >
        ← Products
      </Link>
      <h1 className="mt-4 font-display text-2xl font-semibold text-[var(--foreground)]">
        New product
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
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Slug (URL-friendly, optional — derived from name if empty)
          </label>
          <input
            name="slug"
            type="text"
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            placeholder="e.g. retro-wave-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Description
          </label>
          <textarea
            name="description"
            rows={3}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            defaultValue="Premium apparel. Vibrant, durable design."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Price (€) *
            </label>
            <input
              name="price"
              type="number"
              required
              min="0"
              step="0.01"
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Compare at price (€, optional)
            </label>
            <input
              name="compare_at_price"
              type="number"
              min="0"
              step="0.01"
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
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            >
              <option value="Women">Women</option>
              <option value="Men">Men</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Badge
            </label>
            <select
              name="badge"
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            >
              <option value="">None</option>
              <option value="New">New</option>
              <option value="Sale">Sale</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Color
          </label>
          <input
            name="color"
            type="text"
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            placeholder="e.g. Black, White"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Sizes (comma-separated)
          </label>
          <input
            name="sizes"
            type="text"
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            defaultValue="S,M,L,XL,XXL"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Main image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={uploading}
            className="mt-1 block w-full text-sm text-[var(--muted)]"
          />
          {uploading && (
            <p className="mt-1 text-sm text-[var(--muted)]">Uploading…</p>
          )}
          {imageUrl && (
            <p className="mt-1 truncate text-xs text-[var(--muted)]">
              Image URL set. You can submit the form.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="published"
            id="published"
            defaultChecked
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
            Create product
          </button>
          <Link
            href="/admin/products"
            className="rounded-md border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
