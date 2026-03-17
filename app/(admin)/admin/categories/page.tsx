import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/lib/categories-db";

export default async function CategoriesPage() {
    const categories = await getCategories();

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
                        Categories
                    </h1>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                        Manage dynamic product categories.
                    </p>
                </div>
                <Link
                    href="/admin/categories/new"
                    className="rounded-md bg-[var(--foreground)] px-4 py-2.5 text-sm font-medium text-[var(--background)] hover:bg-[var(--accent)]"
                >
                    Add category
                </Link>
            </div>

            <div className="mt-8 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--card)]">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--muted-bg)]">
                            <th className="px-4 py-3 text-left font-medium text-[var(--foreground)] w-16">
                                Image
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-[var(--foreground)]">
                                Name
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-[var(--foreground)]">
                                Slug
                            </th>
                            <th className="w-20 px-4 py-3 text-right"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr
                                key={category.id}
                                className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted-bg)]"
                            >
                                <td className="px-4 py-3">
                                    <div className="relative h-10 w-10 overflow-hidden rounded bg-[var(--muted-bg)]">
                                        {category.image ? (
                                            <Image src={category.image} alt={category.name} fill className="object-cover" />
                                        ) : (
                                            <span className="flex h-full w-full items-center justify-center text-xs text-[var(--muted)]">No img</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                                    {category.name}
                                </td>
                                <td className="px-4 py-3 text-[var(--muted)]">
                                    {category.slug}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Link
                                        href={`/admin/categories/${category.id}/edit`}
                                        className="text-[var(--accent)] hover:underline"
                                    >
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-4 py-8 text-center text-[var(--muted)]"
                                >
                                    No categories found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
