"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createProduct, uploadProductImage } from "../../actions/products";
import type { CategoryRow } from "@/lib/categories-db";
import type { ColorRow } from "@/lib/colors-db";
import type { ProductFit } from "@/lib/types";

export default function NewProductForm({ categories = [], colors = [] }: { categories: CategoryRow[], colors: ColorRow[] }) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [selectedFits, setSelectedFits] = useState<ProductFit[]>([]);
    const [imageUrl, setImageUrl] = useState("");
    const [name, setName] = useState("");
    const [itemCode, setItemCode] = useState("");
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [colorImages, setColorImages] = useState<Record<string, string>>({});
    const [uploading, setUploading] = useState(false);

    function fileNameToProductName(fileName: string): string {
        const base = fileName.replace(/\.[^/.]+$/, "");
        return base
            .replace(/[_-]+/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .replace(/\b\w/g, (c) => c.toUpperCase());
    }

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
        if (!itemCode.trim()) {
            const guessedCode = fileNameToProductName(file.name)
                .replace(/\s+/g, "-")
                .toUpperCase();
            if (guessedCode) setItemCode(guessedCode);
        }
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

    return (
        <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-6">
            {error && (
                <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
                    {error}
                </p>
            )}

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

            <div>
                <label className="block text-sm font-medium text-[var(--foreground)]">
                    Name *
                </label>
                <input
                    name="name"
                    type="text"
                    required
                    value={name ?? ""}
                    onChange={(e) => setName(e.target.value)}
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
                    Item Code (optional)
                </label>
                <input
                    name="item_code"
                    type="text"
                    value={itemCode ?? ""}
                    onChange={(e) => setItemCode(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    placeholder="e.g. TSHIRT-001"
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
                        Price (Rs.) *
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
                        Compare at price (Rs., optional)
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
                        Select one or both. Color images below apply to every selected fit—no separate images per fit.
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
                    className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    defaultValue="S,M,L,XL,XXL"
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
                    className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    defaultValue="0"
                />
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
    );
}
