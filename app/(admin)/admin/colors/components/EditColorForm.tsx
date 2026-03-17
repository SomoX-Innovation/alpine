"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateColor, deleteColor } from "../../actions/colors";
import type { ColorRow } from "@/lib/colors-db";

export default function EditColorForm({ color }: { color: ColorRow }) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const form = e.currentTarget;
        const formData = new FormData(form);
        const result = await updateColor(color.id, formData);

        if (result.error) {
            setError(result.error);
            return;
        }

        router.push("/admin/colors");
        router.refresh();
    }

    async function handleDelete() {
        if (!confirm("Delete this color? This cannot be undone.")) return;
        setError(null);
        const result = await deleteColor(color.id);
        if (result.error) {
            setError(result.error);
            return;
        }
        router.push("/admin/colors");
        router.refresh();
    }

    return (
        <>
            <Link
                href="/admin/colors"
                className="text-sm text-[var(--accent)] hover:underline"
            >
                ← Colors
            </Link>
            <h1 className="mt-4 font-display text-2xl font-semibold text-[var(--foreground)]">
                Edit color
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
                        defaultValue={color.name}
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
                        defaultValue={color.slug}
                        className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="rounded-md bg-[var(--foreground)] px-4 py-2.5 text-sm font-medium text-[var(--background)] hover:bg-[var(--accent)]"
                    >
                        Save changes
                    </button>
                    <Link
                        href="/admin/colors"
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
