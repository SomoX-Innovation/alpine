"use client";

import { useState } from "react";
import Link from "next/link";

type Tab = "overview" | "orders" | "profile" | "addresses";

const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Orders" },
  { id: "profile", label: "Profile" },
  { id: "addresses", label: "Addresses" },
];

export default function AccountContent() {
  const [active, setActive] = useState<Tab>("overview");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
        My account
      </h1>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <nav className="lg:w-48" aria-label="Account sections">
          <ul className="flex gap-2 overflow-x-auto border-b border-[var(--border)] pb-2 lg:flex-col lg:border-0 lg:pb-0">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  type="button"
                  onClick={() => setActive(tab.id)}
                  className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors lg:block lg:w-full lg:text-left ${
                    active === tab.id
                      ? "bg-[var(--muted-bg)] text-[var(--foreground)]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          {active === "overview" && (
            <div className="space-y-6">
              <p className="text-[var(--muted)]">
                Welcome back. Manage your orders and account details here.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Link
                  href="/women"
                  className="rounded-lg border border-[var(--border)] p-4 text-[var(--foreground)] hover:border-[var(--accent)]"
                >
                  <span className="font-medium">Continue shopping</span>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Browse new arrivals and collections
                  </p>
                </Link>
                <Link
                  href="/cart"
                  className="rounded-lg border border-[var(--border)] p-4 text-[var(--foreground)] hover:border-[var(--accent)]"
                >
                  <span className="font-medium">View cart</span>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Review items and checkout
                  </p>
                </Link>
              </div>
            </div>
          )}

          {active === "orders" && (
            <div>
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                Order history
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                You haven&apos;t placed any orders yet. When you do, they&apos;ll appear here.
              </p>
            </div>
          )}

          {active === "profile" && (
            <form className="space-y-4 max-w-md">
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                Profile details
              </h2>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue="customer@example.com"
                  className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    First name
                  </label>
                  <input
                    type="text"
                    defaultValue=""
                    className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    Last name
                  </label>
                  <input
                    type="text"
                    defaultValue=""
                    className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="rounded-md bg-[var(--foreground)] px-4 py-2.5 text-sm font-semibold text-[var(--background)] hover:bg-[var(--accent)]"
              >
                Save changes
              </button>
            </form>
          )}

          {active === "addresses" && (
            <div>
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                Saved addresses
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                No saved addresses. Add one at checkout.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
