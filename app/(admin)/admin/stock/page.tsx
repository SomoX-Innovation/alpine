import Link from "next/link";
import Image from "next/image";
import { getAllProducts, type ProductRow } from "@/lib/products-db";
import {
  LOW_STOCK_MAX,
  analyzeTrackedStock,
  stockDashboardSortKey,
  stockStatusForAnalysis,
  type AnalyzedTrackedStock,
} from "@/lib/admin-stock";

function StatusBadge({ analysis }: { analysis: AnalyzedTrackedStock }) {
  const s = stockStatusForAnalysis(analysis);
  if (s === "out") {
    return (
      <span className="inline-flex rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
        Out of stock
      </span>
    );
  }
  if (s === "low") {
    return (
      <span className="inline-flex rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300">
        Low (≤{LOW_STOCK_MAX})
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-emerald-500/12 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-400">
      OK
    </span>
  );
}

export default async function AdminStockPage() {
  const products = await getAllProducts(true);
  const tracked = products.filter((p) => p.track_stock === true);
  const notTracked = products.filter((p) => p.track_stock !== true);

  const totalUnitsAll = tracked.reduce((sum, p) => {
    const a = analyzeTrackedStock(p);
    return sum + (a?.totalUnits ?? 0);
  }, 0);

  const attentionCount = tracked.filter((p) => {
    const a = analyzeTrackedStock(p);
    return a && stockStatusForAnalysis(a) !== "ok";
  }).length;

  const sortedTracked = [...tracked].sort((a, b) => {
    const ka = stockDashboardSortKey(a.name, analyzeTrackedStock(a));
    const kb = stockDashboardSortKey(b.name, analyzeTrackedStock(b));
    if (ka[0] !== kb[0]) return ka[0] - kb[0];
    return ka[1].localeCompare(kb[1]);
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">Stock</h1>
          <p className="mt-1 max-w-xl text-sm text-[var(--muted)]">
            Products with <strong className="text-[var(--foreground)]/90">Track stock</strong> enabled.
            Low = any line with 1–{LOW_STOCK_MAX} units, or pooled total in that range.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="shrink-0 rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] hover:bg-[var(--accent)]"
        >
          Add product
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <p className="text-sm font-medium text-[var(--muted)]">Tracking inventory</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--foreground)]">
            {tracked.length}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">products</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <p className="text-sm font-medium text-[var(--muted)]">Units on hand</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--foreground)]">
            {totalUnitsAll.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">sum of all tracked lines</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <p className="text-sm font-medium text-[var(--muted)]">Needs attention</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-amber-700 dark:text-amber-400">
            {attentionCount}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">out of stock or low</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <p className="text-sm font-medium text-[var(--muted)]">Not tracking</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--muted)]">
            {notTracked.length}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">unlimited storefront qty</p>
        </div>
      </div>

      {tracked.length === 0 ? (
        <p className="mt-10 text-sm text-[var(--muted)]">
          No products use stock tracking yet. Edit a product and enable{" "}
          <span className="text-[var(--foreground)]">Track stock</span>, or{" "}
          <Link href="/admin/products" className="text-[var(--accent)] hover:underline">
            open Products
          </Link>
          .
        </p>
      ) : (
        <div className="mt-10 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <div className="border-b border-[var(--border)] bg-[var(--muted-bg)]/60 px-4 py-3">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Inventory by product</h2>
            <p className="text-xs text-[var(--muted)]">
              Worst status first (out → low → OK). Edit to change quantities.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3 text-right">Total units</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="min-w-[14rem] px-4 py-3">Breakdown</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {sortedTracked.map((p) => (
                  <StockRow key={p.id} p={p} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {notTracked.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
            Not tracking stock
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            These products do not decrement inventory on checkout.
          </p>
          <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted-bg)]">
                  <th className="px-4 py-2 text-left font-medium text-[var(--foreground)]">Product</th>
                  <th className="px-4 py-2 text-left font-medium text-[var(--foreground)]">Status</th>
                  <th className="px-4 py-2 text-left font-medium text-[var(--foreground)]" />
                </tr>
              </thead>
              <tbody>
                {notTracked.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-2 text-[var(--foreground)]">{p.name}</td>
                    <td className="px-4 py-2 text-[var(--muted)]">
                      {p.published ? "Published" : "Draft"}
                    </td>
                    <td className="px-4 py-2">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="text-[var(--accent)] hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function StockRow({ p }: { p: ProductRow }) {
  const analysis = analyzeTrackedStock(p);
  if (!analysis) return null;

  const showLines = analysis.lines.slice(0, 8);
  const more = analysis.lines.length - showLines.length;

  return (
    <tr className="border-b border-[var(--border)] last:border-0 align-top">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-[var(--muted-bg)]">
            <Image
              src={p.image}
              alt=""
              fill
              unoptimized={p.image.includes("/storage/v1/object/public/")}
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-[var(--foreground)]">{p.name}</p>
            <p className="text-xs text-[var(--muted)]">{p.category}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-[var(--muted)] tabular-nums">{p.item_code ?? "—"}</td>
      <td className="px-4 py-3">
        {analysis.mode === "pooled" ? (
          <span className="rounded-md bg-[var(--muted-bg)] px-2 py-1 text-xs font-medium text-[var(--foreground)]">
            Pooled
          </span>
        ) : (
          <span className="rounded-md bg-[var(--muted-bg)] px-2 py-1 text-xs font-medium text-[var(--foreground)]">
            {analysis.lineCount} variant{analysis.lineCount === 1 ? "" : "s"}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right font-semibold tabular-nums text-[var(--foreground)]">
        {analysis.totalUnits.toLocaleString()}
      </td>
      <td className="px-4 py-3">
        <StatusBadge analysis={analysis} />
      </td>
      <td className="px-4 py-3">
        <ul className="max-h-36 space-y-1 overflow-y-auto text-xs text-[var(--muted)]">
          {showLines.map((line, i) => (
            <li
              key={`${line.label}-${i}`}
              className="flex justify-between gap-2 border-b border-[var(--border)]/50 py-0.5 last:border-0"
            >
              <span className="min-w-0 truncate">{line.label}</span>
              <span className="shrink-0 tabular-nums font-medium text-[var(--foreground)]">{line.qty}</span>
            </li>
          ))}
          {more > 0 && <li className="text-[var(--muted)]">+{more} more…</li>}
        </ul>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <Link href={`/admin/products/${p.id}/edit`} className="text-[var(--accent)] hover:underline">
          Edit
        </Link>
      </td>
    </tr>
  );
}
