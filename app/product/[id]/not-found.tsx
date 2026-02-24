import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
      <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
        Product not found
      </h1>
      <p className="mt-2 text-[var(--muted)]">
        This item may have been removed or the link is incorrect.
      </p>
      <Link
        href="/"
        className="mt-6 text-[var(--accent)] font-medium hover:underline"
      >
        Back to home
      </Link>
    </div>
  );
}
