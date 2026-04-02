"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderLineItem } from "@/app/actions/orders";
import { updateOrderLineItemsAdmin } from "@/app/actions/orders";
import type { AdminOrderProduct } from "@/lib/admin-order-product-search";
import {
  adminUnitPriceForProduct,
  filterAdminProductsForSearch,
  formatAdminProductPickerLabel,
} from "@/lib/admin-order-product-search";

export default function OrderItemsEditor({
  orderId,
  initialItems,
  products,
}: {
  orderId: string;
  initialItems: OrderLineItem[];
  products: AdminOrderProduct[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<OrderLineItem[]>(initialItems);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [productQueryByRow, setProductQueryByRow] = useState<Record<number, string>>({});

  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, i) =>
          sum + (Number(i.price) || 0) * Math.max(0, Math.floor(Number(i.quantity) || 0)),
        0
      ),
    [items]
  );

  function setProductForRow(idx: number, productId: string) {
    const p = productsById.get(productId);
    if (!p) {
      setItems((prev) =>
        prev.map((row, i) =>
          i === idx ? { ...row, productId: "", name: "", price: 0, size: "M", fit: undefined, color: undefined, image: undefined } : row
        )
      );
      return;
    }
    const defaultSize = p.sizes[0] ?? "M";
    const defaultFit = p.fits.length === 1 ? p.fits[0] : undefined;
    const defaultColor = p.colors.length > 0 ? p.colors[0] : undefined;
    setItems((prev) =>
      prev.map((row, i) =>
        i === idx
          ? {
              ...row,
              productId: p.id,
              name: p.name,
              price: adminUnitPriceForProduct(p, defaultFit ?? ""),
              image: p.image || undefined,
              size: defaultSize,
              fit: defaultFit,
              color: defaultColor,
            }
          : row
      )
    );
  }

  function onFitChange(rowIndex: number, fitRaw: string) {
    const fit = (fitRaw || undefined) as OrderLineItem["fit"] | undefined;
    setItems((prev) => {
      const row = prev[rowIndex];
      const p = row?.productId ? productsById.get(row.productId) : undefined;
      return prev.map((r, i) => {
        if (i !== rowIndex) return r;
        const next: OrderLineItem = { ...r, fit };
        if (p) {
          return { ...next, price: adminUnitPriceForProduct(p, next.fit ?? "") };
        }
        return next;
      });
    });
  }

  function updateField<K extends keyof OrderLineItem>(index: number, key: K, value: OrderLineItem[K]) {
    setItems((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  }

  function removeRow(index: number) {
    const ok = window.confirm("Remove this item row?");
    if (!ok) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
    setProductQueryByRow((prev) => {
      const next: Record<number, string> = {};
      for (const [k, v] of Object.entries(prev)) {
        const i = Number(k);
        if (i === index) continue;
        next[i < index ? i : i - 1] = v;
      }
      return next;
    });
  }

  function addRow() {
    setItems((prev) => [
      ...prev,
      {
        productId: "",
        name: "",
        size: "M",
        quantity: 1,
        price: 0,
      },
    ]);
  }

  async function save() {
    setError(null);
    setSuccess(false);
    setSaving(true);
    const result = await updateOrderLineItemsAdmin(orderId, items);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    router.refresh();
    window.setTimeout(() => setSuccess(false), 3000);
  }

  const manualOnly = products.length === 0;

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Items</h2>
        <button
          type="button"
          onClick={addRow}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
        >
          + Add item row
        </button>
      </div>
      {error && (
        <p className="mt-2 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>
      )}
      {success && (
        <p className="mt-2 rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
          Items updated.
        </p>
      )}
      {manualOnly && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          No published products in catalog — use manual fields below or add products first.
        </p>
      )}
      <div className="mt-3 space-y-3">
        {items.map((item, i) => {
          if (manualOnly) {
            return (
              <div key={`${item.productId}-${i}`} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={item.name}
                    onChange={(e) => updateField(i, "name", e.target.value)}
                    placeholder="Item name"
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  />
                  <input
                    value={item.productId}
                    onChange={(e) => updateField(i, "productId", e.target.value)}
                    placeholder="Product ID"
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  />
                  <input
                    value={item.color ?? ""}
                    onChange={(e) => updateField(i, "color", e.target.value || undefined)}
                    placeholder="Color"
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  />
                  <select
                    value={item.fit ?? ""}
                    onChange={(e) => onFitChange(i, e.target.value)}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  >
                    <option value="">No fit</option>
                    <option value="Regular">Regular</option>
                    <option value="Oversize">Oversize</option>
                  </select>
                  <input
                    value={item.size}
                    onChange={(e) => updateField(i, "size", e.target.value)}
                    placeholder="Size"
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={Number(item.price) || 0}
                    onChange={(e) => updateField(i, "price", Number(e.target.value) || 0)}
                    placeholder="Unit price"
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={Math.max(1, Math.floor(Number(item.quantity) || 1))}
                    onChange={(e) => updateField(i, "quantity", Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                    placeholder="Qty"
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  />
                  <input
                    value={item.image ?? ""}
                    onChange={(e) => updateField(i, "image", e.target.value || undefined)}
                    placeholder="Image URL (optional)"
                    className="sm:col-span-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-[var(--muted)]">
                    Line total: Rs.{" "}
                    {((Number(item.price) || 0) * Math.max(0, Math.floor(Number(item.quantity) || 0))).toFixed(2)}
                  </p>
                  <button type="button" onClick={() => removeRow(i)} className="text-xs text-red-500 hover:underline">
                    Remove row
                  </button>
                </div>
              </div>
            );
          }

          const selectedProduct = productsById.get(item.productId);
          const fitOptions = selectedProduct?.fits ?? [];
          const colorOptions = selectedProduct?.colors ?? [];
          const sizeOptions = selectedProduct?.sizes ?? ["M"];
          const previewImage = item.image || selectedProduct?.image || "";
          const searchQ = productQueryByRow[i] ?? "";
          const filtered = filterAdminProductsForSearch(products, searchQ);

          return (
            <div key={`${item.productId}-${i}`} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="shrink-0">
                  {previewImage ? (
                    <div className="relative h-28 w-24 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--muted-bg)]">
                      <Image
                        src={previewImage}
                        alt={item.name || "Product image"}
                        fill
                        unoptimized={previewImage.includes("/storage/v1/object/public/")}
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-28 w-24 items-center justify-center rounded-md border border-dashed border-[var(--border)] bg-[var(--muted-bg)] text-xs text-[var(--muted)]">
                      No image
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Search products</label>
                    <input
                      value={searchQ}
                      onChange={(e) =>
                        setProductQueryByRow((prev) => ({
                          ...prev,
                          [i]: e.target.value,
                        }))
                      }
                      placeholder="Search by name, item code, or price (e.g. Girl, ABC-01, 2199)"
                      autoComplete="off"
                      aria-label="Search product by name or price"
                      className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
                    />
                    {searchQ.trim() !== "" && filtered.length > 0 ? (
                      <ul className="mt-1 max-h-36 overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--card)] text-sm shadow-md" role="listbox">
                        {filtered.slice(0, 12).map((p) => (
                          <li key={p.id} role="option">
                            <button
                              type="button"
                              className="w-full px-3 py-2 text-left hover:bg-[var(--muted-bg)]"
                              onClick={() => {
                                setProductForRow(i, p.id);
                                setProductQueryByRow((prev) => ({ ...prev, [i]: "" }));
                              }}
                            >
                              <span className="text-[var(--foreground)]">{formatAdminProductPickerLabel(p)}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {searchQ.trim() !== "" && filtered.length === 0 ? (
                      <p className="mt-1 text-xs text-[var(--muted)]">No matching products.</p>
                    ) : null}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Product</label>
                    <select
                      value={item.productId}
                      onChange={(e) => setProductForRow(i, e.target.value)}
                      className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                    >
                      <option value="">Select product</option>
                      {filtered.map((p) => (
                        <option key={p.id} value={p.id}>
                          {formatAdminProductPickerLabel(p)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    value={item.name}
                    readOnly
                    placeholder="Item name"
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--muted-bg)] px-3 py-2 text-sm text-[var(--muted)]"
                    title="Filled when you pick a product"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    {colorOptions.length > 0 ? (
                      <select
                        value={item.color ?? colorOptions[0]}
                        onChange={(e) => updateField(i, "color", e.target.value || undefined)}
                        className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                      >
                        {colorOptions.map((color) => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value="No color options"
                        readOnly
                        className="rounded-md border border-[var(--border)] bg-[var(--muted-bg)] px-3 py-2 text-sm text-[var(--muted)]"
                      />
                    )}
                    {fitOptions.length > 1 ? (
                      <select
                        value={item.fit ?? ""}
                        onChange={(e) => onFitChange(i, e.target.value)}
                        className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                      >
                        <option value="">Select fit</option>
                        {fitOptions.map((fit) => (
                          <option key={fit} value={fit}>
                            {fit}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={fitOptions[0] ?? "No fit required"}
                        readOnly
                        className="rounded-md border border-[var(--border)] bg-[var(--muted-bg)] px-3 py-2 text-sm text-[var(--muted)]"
                      />
                    )}
                    <select
                      value={item.size}
                      onChange={(e) => updateField(i, "size", e.target.value)}
                      className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm sm:col-span-2"
                    >
                      {sizeOptions.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                    <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={Number(item.price) || 0}
                        onChange={(e) => updateField(i, "price", Number(e.target.value) || 0)}
                        placeholder="Unit price"
                        className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                      />
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={Math.max(1, Math.floor(Number(item.quantity) || 1))}
                        onChange={(e) => updateField(i, "quantity", Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                        placeholder="Qty"
                        className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                      />
                    </div>
                    <input
                      value={item.image ?? ""}
                      onChange={(e) => updateField(i, "image", e.target.value || undefined)}
                      placeholder="Image URL (override)"
                      className="sm:col-span-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-[var(--muted)]">
                  Line total: Rs. {((Number(item.price) || 0) * Math.max(0, Math.floor(Number(item.quantity) || 0))).toFixed(2)}
                </p>
                <button type="button" onClick={() => removeRow(i)} className="text-xs text-red-500 hover:underline">
                  Remove row
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
        <p className="text-sm text-[var(--muted)]">Subtotal preview</p>
        <p className="text-sm font-semibold text-[var(--foreground)]">Rs. {subtotal.toFixed(2)}</p>
      </div>
      <button
        type="button"
        onClick={save}
        disabled={saving || items.length === 0}
        className="mt-3 rounded-md bg-[var(--foreground)] px-4 py-2.5 text-sm font-medium text-[var(--background)] hover:bg-[var(--accent)] disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save item changes"}
      </button>
    </section>
  );
}
