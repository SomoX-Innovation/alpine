"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateProduct, deleteProduct, uploadProductImage } from "../../actions/products";
import type { ProductRow } from "@/lib/products-db";
import type { CategoryRow } from "@/lib/categories-db";
import type { ColorRow } from "@/lib/colors-db";
import type { ProductFit } from "@/lib/types";

function initialFitsFromRow(p: ProductRow): ProductFit[] {
  const raw = p.fits;
  if (Array.isArray(raw)) {
    const out: ProductFit[] = [];
    for (const x of raw) {
      if (x === "Oversize" || x === "Regular") out.push(x);
    }
    const uniq = [...new Set(out)];
    if (uniq.length) return uniq;
  }
  if (p.fit === "Oversize" || p.fit === "Regular") return [p.fit];
  return [];
}

export default function EditProductForm({ product, categories = [], colors = [] }: { product: ProductRow, categories: CategoryRow[], colors: ColorRow[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [selectedFits, setSelectedFits] = useState<ProductFit[]>(() => initialFitsFromRow(product));
  const [imageUrl, setImageUrl] = useState(product.image);
  const [galleryUrls, setGalleryUrls] = useState<string[]>(
    Array.isArray(product.images)
      ? product.images.filter((u): u is string => typeof u === "string" && u.trim().length > 0)
      : []
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(Array.isArray(product.colors) ? product.colors : []);
  const [colorImages, setColorImages] = useState<Record<string, string>>(
    product.color_images && typeof product.color_images === "object"
      ? Object.fromEntries(
        Object.entries(product.color_images).filter(
          ([k, v]) => k.trim().length > 0 && typeof v === "string" && v.trim().length > 0
        )
      )
      : {}
  );
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
    if (result.url) {
      const url = result.url;
      setImageUrl(url);
      setGalleryUrls((prev) => (prev.includes(url) ? prev : [url, ...prev]));
    }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    const uploaded: string[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadProductImage(formData);
      if (result.error) {
        setUploading(false);
        setError(result.error);
        return;
      }
      if (result.url) uploaded.push(result.url);
    }
    setUploading(false);
    setGalleryUrls((prev) => {
      const seen = new Set(prev);
      for (const u of uploaded) seen.add(u);
      return Array.from(seen);
    });
  }

  function removeGalleryUrl(url: string) {
    setGalleryUrls((prev) => prev.filter((u) => u !== url));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.delete("colors");
    selectedColors.forEach((c) => formData.append("colors", c));
    formData.delete("fits");
    selectedFits.forEach((f) => formData.append("fits", f));
    formData.set("color_images", JSON.stringify(colorImages));
    formData.set("image", imageUrl);
    formData.set("images_json", JSON.stringify(galleryUrls));
    const result = await updateProduct(product.id, formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  function toggleFit(fit: ProductFit) {
    setSelectedFits((prev) =>
      prev.includes(fit) ? prev.filter((x) => x !== fit) : [...prev, fit]
    );
  }

  function toggleColor(colorName: string) {
    setSelectedColors((prev) => {
      const exists = prev.includes(colorName);
      if (exists) {
        const next = prev.filter((c) => c !== colorName);
        setColorImages((old) => {
          const copy = { ...old };
          delete copy[colorName];
          return copy;
        });
        return next;
      }
      return [...prev, colorName];
    });
  }

  function updateColorImage(colorName: string, url: string) {
    setColorImages((prev) => ({ ...prev, [colorName]: url }));
  }

  async function uploadColorImage(colorName: string, file: File | undefined) {
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
    if (result.url) {
      updateColorImage(colorName, result.url);
    }
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
            <span className="block text-sm font-medium text-[var(--foreground)]">
              Fit (for filtering only)
            </span>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Select one or both. Color images apply to every selected fit—no separate images per fit.
            </p>
            <div className="mt-2 flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedFits.includes("Regular")}
                  onChange={() => toggleFit("Regular")}
                  className="rounded border-[var(--border)]"
                />
                <span className="text-sm text-[var(--foreground)]">Regular</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedFits.includes("Oversize")}
                  onChange={() => toggleFit("Oversize")}
                  className="rounded border-[var(--border)]"
                />
                <span className="text-sm text-[var(--foreground)]">Oversize</span>
              </label>
            </div>
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
                  value={c.name}
                  checked={selectedColors.includes(c.name)}
                  onChange={() => toggleColor(c.name)}
                  className="rounded border-[var(--border)]"
                />
                <span className="text-sm text-[var(--foreground)]">{c.name}</span>
              </label>
            ))}
          </div>
        </div>

        {selectedColors.length > 0 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Color-wise images
            </label>
            <p className="text-xs text-[var(--muted)]">
              One image per color is used for all selected fits (Regular and/or Oversize).
            </p>
            {selectedColors.map((colorName) => (
              <div key={colorName} className="rounded-md border border-[var(--border)] p-3">
                <p className="text-sm font-medium text-[var(--foreground)]">{colorName}</p>
                <input
                  type="text"
                  value={colorImages[colorName] ?? ""}
                  onChange={(e) => updateColorImage(colorName, e.target.value)}
                  className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
                  placeholder="https://..."
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => uploadColorImage(colorName, e.target.files?.[0])}
                  disabled={uploading}
                  className="mt-2 block w-full text-sm text-[var(--muted)]"
                />
              </div>
            ))}
          </div>
        )}

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
          <label className="block text-sm font-medium text-[var(--foreground)]" htmlFor="ordered_quantity">
            Order count (storefront)
          </label>
          <input
            id="ordered_quantity"
            name="ordered_quantity"
            type="number"
            min={0}
            step={1}
            defaultValue={product.ordered_quantity ?? 0}
            className="mt-1 w-full max-w-xs rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
          <p className="mt-1 text-xs text-[var(--muted)]">
            Shown as “X ordered” on the store. Set a starting value for new products; real orders add to this
            when{" "}
            <code className="rounded bg-[var(--muted-bg)] px-1 font-mono text-[10px]">
              SUPABASE_SERVICE_ROLE_KEY
            </code>{" "}
            is configured.
          </p>
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

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Additional gallery images (auto WebP)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryUpload}
            disabled={uploading}
            className="mt-2 block w-full text-sm text-[var(--muted)]"
          />
          {galleryUrls.length > 0 && (
            <div className="mt-2 space-y-1">
              {galleryUrls.map((url) => (
                <div key={url} className="flex items-center justify-between gap-2 rounded border border-[var(--border)] px-2 py-1">
                  <p className="truncate text-xs text-[var(--muted)]">{url}</p>
                  <button
                    type="button"
                    onClick={() => removeGalleryUrl(url)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
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
