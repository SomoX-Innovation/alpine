"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createCategory } from "../../actions/categories";

export default function NewCategoryPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState("");
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
        const result = await createCategory(formData);

        if (result.error) {
            setError(result.error);
            return;
        }

        if (result.id) {
            router.push("/admin/categories");
            router.refresh();
        }
    }

    return (
        <div>
            <Link
                href="/admin/categories"
                className="text-sm text-[var(--accent)] hover:underline"
            >
                ← Categories
            </Link>
            <h1 className="mt-4 font-display text-2xl font-semibold text-[var(--foreground)]">
                New category
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
                        placeholder="e.g. vintage"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-[var(--foreground)]">
                        Category Image
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

                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="rounded-md bg-[var(--foreground)] px-4 py-2.5 text-sm font-medium text-[var(--background)] hover:bg-[var(--accent)]"
                    >
                        Create category
                    </button>
                    <Link
                        href="/admin/categories"
                        className="rounded-md border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
