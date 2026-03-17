"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createColor } from "../../actions/colors";

export default function NewColorPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const form = e.currentTarget;
        const formData = new FormData(form);
        const result = await createColor(formData);

        if (result.error) {
            setError(result.error);
            return;
        }

        if (result.id) {
            router.push("/admin/colors");
            router.refresh();
        }
    }

    return (
        <div>
            <Link
                href="/admin/colors"
                className="text-sm text-[var(--accent)] hover:underline"
            >
                ← Colors
            </Link>
            <h1 className="mt-4 font-display text-2xl font-semibold text-[var(--foreground)]">
                New color
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
                        placeholder="e.g. cobalt-blue"
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="rounded-md bg-[var(--foreground)] px-4 py-2.5 text-sm font-medium text-[var(--background)] hover:bg-[var(--accent)]"
                    >
                        Create color
                    </button>
                    <Link
                        href="/admin/colors"
                        className="rounded-md border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
