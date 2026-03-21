"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import type { CustomerOrderSummary } from "@/app/actions/orders";
import OrderStatusBadge from "@/components/OrderStatusBadge";

function thumbUnoptimized(src: string) {
  return src.includes("/storage/v1/object/public/");
}

type Tab = "overview" | "orders" | "profile" | "addresses";

const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Orders" },
  { id: "profile", label: "Profile" },
  { id: "addresses", label: "Addresses" },
];

export default function AccountContent({
  userEmail,
  userConfirmed,
  orders = [],
}: {
  userEmail?: string | null;
  userConfirmed?: boolean;
  orders?: CustomerOrderSummary[];
}) {
  const [active, setActive] = useState<Tab>("overview");
  const needsEmailConfirmation = Boolean(userEmail) && userConfirmed === false;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
        My account
      </h1>

      <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
        {userEmail ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-[var(--foreground)]">
                Signed in
              </div>
              <div className="text-sm text-[var(--muted)]">{userEmail}</div>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                Log out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-[var(--muted)]">
              Sign in to view your order history and account details.
            </div>
            <div className="flex gap-3">
              <Link
                href="/login"
                className="rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-[var(--background)] hover:bg-[var(--accent)]"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <nav className="lg:w-48" aria-label="Account sections">
          <ul className="flex gap-2 overflow-x-auto border-b border-[var(--border)] pb-2 lg:flex-col lg:border-0 lg:pb-0">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  type="button"
                  onClick={() => setActive(tab.id)}
                  disabled={needsEmailConfirmation}
                  aria-disabled={needsEmailConfirmation}
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
          {needsEmailConfirmation && (
            <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-[var(--foreground)]">
              <div className="font-semibold">Confirm your email</div>
              <div className="mt-1 text-sm text-[var(--muted)]">
                Please visit your mailbox and confirm your email address to activate your account.
              </div>
            </div>
          )}
          {active === "overview" && (
            <div className="space-y-6">
              <p className="text-[var(--muted)]">
                {userEmail
                  ? "Welcome back. Manage your orders and account details here."
                  : "You're not signed in yet. Please sign in to manage your orders and account details."}
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
              {!userEmail ? (
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Sign in to see your orders.
                </p>
              ) : orders.length === 0 ? (
                <p className="mt-2 text-sm text-[var(--muted)]">
                  You haven&apos;t placed any orders yet. When you do, they&apos;ll appear here.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {orders.map((o) => {
                    const lines = o.line_items ?? [];
                    const firstWithImage = lines.find((l) => l.image?.trim());
                    const previewName = lines[0]?.name;
                    const moreCount = Math.max(0, lines.length - 1);
                    return (
                      <li key={o.id}>
                        <Link
                          href={`/account/orders/${o.id}`}
                          className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 transition hover:border-[var(--accent)]/40 hover:bg-[var(--muted-bg)]/50 sm:gap-4 sm:p-4"
                        >
                          <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--muted-bg)] ring-1 ring-[var(--border)] sm:h-24 sm:w-20">
                            {firstWithImage?.image ? (
                              <Image
                                src={firstWithImage.image}
                                alt={previewName ?? "Order item"}
                                fill
                                sizes="80px"
                                unoptimized={thumbUnoptimized(firstWithImage.image)}
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]" aria-hidden>
                                —
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-sm font-semibold text-[var(--foreground)] sm:text-base">
                                {o.order_number}
                              </span>
                              <OrderStatusBadge status={o.status} />
                            </div>
                            {previewName && (
                              <p className="mt-1 line-clamp-2 text-sm text-[var(--foreground)]">
                                {previewName}
                                {moreCount > 0 ? (
                                  <span className="text-[var(--muted)]"> · +{moreCount} more</span>
                                ) : null}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-[var(--muted)]">
                              {new Date(o.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end justify-center gap-1">
                            <span className="text-sm font-bold text-[var(--foreground)] sm:text-base">
                              Rs. {Number(o.total).toFixed(2)}
                            </span>
                            <span className="text-xs font-medium text-[var(--accent)]">View →</span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
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
                  readOnly
                  defaultValue={userEmail ?? ""}
                  className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--muted-bg)] px-4 py-2.5 text-[var(--foreground)]"
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
