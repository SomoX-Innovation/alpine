"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateCategory, deleteCategory } from "../../actions/categories";
import type { CategoryRow } from "@/lib/categories-db";

export default function EditCategoryForm({ category }: { category: CategoryRow }) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState(category.image ?? "");
    const [uploading, setUploading] = useState(false);

    async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setError(null);
        const { uploadCategoryImage } = await import("../../actions/categories");
        const formData = new FormData();
        formData.set("file", file);
        const result = await uploadCategoryImage(formData);
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
        const result = await updateCategory(category.id, formData);

        if (result.error) {
            setError(result.error);
            return;
        }

        router.push("/admin/categories");
        router.refresh();
    }

    async function handleDelete() {
        if (!confirm("Delete this category? This cannot be undone.")) return;
        setError(null);
        const result = await deleteCategory(category.id);
        if (result.error) {
            setError(result.error);
            return;
        }
        router.push("/admin/categories");
        router.refresh();
    }

    return (
        <>
            <Link
                href="/admin/categories"
                className="text-sm text-[var(--accent)] hover:underline"
            >
                ← Categories
            </Link>
            <h1 className="mt-4 font-display text-2xl font-semibold text-[var(--foreground)]">
                Edit category
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
                        defaultValue={category.name}
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
                        defaultValue={category.slug}
                        className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-[var(--foreground)]">
                        Category Image
                    </label>
                    <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="mt-1 flex w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
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

                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="rounded-md bg-[var(--foreground)] px-4 py-2.5 text-sm font-medium text-[var(--background)] hover:bg-[var(--accent)]"
                    >
                        Save changes
                    </button>
                    <Link
                        href="/admin/categories"
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
