"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "../actions/auth";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <aside className="w-56 shrink-0 border-r border-[var(--border)] bg-[var(--card)]">
        <div className="p-4">
          <Link
            href="/admin"
            className="font-display text-lg font-semibold text-[var(--foreground)]"
          >
            Alpine Admin
          </Link>
        </div>
        <nav className="space-y-0.5 px-2 pb-4">
          <Link
            href="/admin"
            className={`block rounded-md px-3 py-2 text-sm font-medium ${pathname === "/admin"
              ? "bg-[var(--muted-bg)] text-[var(--foreground)]"
              : "text-[var(--muted)] hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]"
              }`}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            className={`block rounded-md px-3 py-2 text-sm font-medium ${pathname?.startsWith("/admin/products")
              ? "bg-[var(--muted-bg)] text-[var(--foreground)]"
              : "text-[var(--muted)] hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]"
              }`}
          >
            Products
          </Link>
          <Link
            href="/admin/dtf"
            className={`block rounded-md px-3 py-2 text-sm font-medium ${pathname?.startsWith("/admin/dtf")
              ? "bg-[var(--muted-bg)] text-[var(--foreground)]"
              : "text-[var(--muted)] hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]"
              }`}
          >
            DTF
          </Link>
          <Link
            href="/admin/categories"
            className={`block rounded-md px-3 py-2 text-sm font-medium ${pathname?.startsWith("/admin/categories")
              ? "bg-[var(--muted-bg)] text-[var(--foreground)]"
              : "text-[var(--muted)] hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]"
              }`}
          >
            Categories
          </Link>
          <Link
            href="/admin/colors"
            className={`block rounded-md px-3 py-2 text-sm font-medium ${pathname?.startsWith("/admin/colors")
              ? "bg-[var(--muted-bg)] text-[var(--foreground)]"
              : "text-[var(--muted)] hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]"
              }`}
          >
            Colors
          </Link>
          <Link
            href="/admin/orders"
            className={`block rounded-md px-3 py-2 text-sm font-medium ${pathname?.startsWith("/admin/orders")
              ? "bg-[var(--muted-bg)] text-[var(--foreground)]"
              : "text-[var(--muted)] hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]"
              }`}
          >
            Orders
          </Link>
          <Link
            href="/admin/content"
            className={`block rounded-md px-3 py-2 text-sm font-medium ${pathname?.startsWith("/admin/content")
              ? "bg-[var(--muted-bg)] text-[var(--foreground)]"
              : "text-[var(--muted)] hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]"
              }`}
          >
            Content
          </Link>
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-6">
          <span className="text-sm text-[var(--muted)]">Admin</span>
          <div className="flex items-center gap-4">
            <form action={logout}>
              <button
                type="submit"
                className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                Log out
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
