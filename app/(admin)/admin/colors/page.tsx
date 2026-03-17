import Link from "next/link";
import { getColors } from "@/lib/colors-db";

export default async function ColorsPage() {
    const colors = await getColors();

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
                        Colors
                    </h1>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                        Manage dynamic product colors.
                    </p>
                </div>
                <Link
                    href="/admin/colors/new"
                    className="rounded-md bg-[var(--foreground)] px-4 py-2.5 text-sm font-medium text-[var(--background)] hover:bg-[var(--accent)]"
                >
                    Add color
                </Link>
            </div>

            <div className="mt-8 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--card)]">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--muted-bg)]">
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
                        {colors.map((color) => (
                            <tr
                                key={color.id}
                                className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted-bg)]"
                            >
                                <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                                    {color.name}
                                </td>
                                <td className="px-4 py-3 text-[var(--muted)]">
                                    {color.slug}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Link
                                        href={`/admin/colors/${color.id}/edit`}
                                        className="text-[var(--accent)] hover:underline"
                                    >
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {colors.length === 0 && (
                            <tr>
                                <td
                                    colSpan={3}
                                    className="px-4 py-8 text-center text-[var(--muted)]"
                                >
                                    No colors found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
