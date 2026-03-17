"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

const navLinks = [
  { href: "/women", label: "Women" },
  { href: "/men", label: "Men" },
  { href: "/dtf", label: "DTF" },
  { href: "/new-arrivals", label: "New Designs" },
  { href: "/sale", label: "Sale" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-[var(--foreground)] hover:bg-[var(--muted-bg)] lg:hidden"
          aria-label="Open menu"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center" aria-label="Alpine – Home">
          <Image
            src="/logo.png"
            alt="Alpine"
            width={120}
            height={36}
            className="h-8 w-auto sm:h-9"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--foreground)] transition-colors hover:text-[var(--accent)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: search, account, cart */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/search"
            className="rounded-md p-2 text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
            aria-label="Search"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </Link>
          <Link
            href="/account"
            className="hidden rounded-md p-2 text-[var(--foreground)] hover:bg-[var(--muted-bg)] sm:block"
            aria-label="Account"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </Link>
          <Link
            href="/cart"
            className="relative rounded-md p-2 text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
            aria-label={`Cart (${count} items)`}
          >
            {count > 0 && (
              <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-semibold text-[var(--background)]">
                {count > 9 ? "9+" : count}
              </span>
            )}
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-[var(--border)] bg-[var(--card)] lg:hidden">
          <nav className="flex flex-col gap-0 px-4 py-4" aria-label="Main mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2.5 text-base font-medium text-[var(--foreground)] hover:bg-[var(--muted-bg)] hover:text-[var(--accent)]"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
