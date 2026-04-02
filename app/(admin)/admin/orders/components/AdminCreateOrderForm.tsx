"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderLineItem } from "@/app/actions/orders";
import { createOrderAdmin } from "@/app/(admin)/admin/orders/server-actions";
import { CURRENCY, SHIPPING_COUNTRY } from "@/lib/currency";
import type { AdminOrderProduct } from "@/lib/admin-order-product-search";
import {
  adminUnitPriceForProduct,
  filterAdminProductsForSearch,
  formatAdminProductPickerLabel,
} from "@/lib/admin-order-product-search";

type Ship = { address: string; city: string; postalCode: string; country: string };

export default function AdminCreateOrderForm({ products }: { products: AdminOrderProduct[] }) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [shipping, setShipping] = useState<Ship>({
    address: "",
    city: "",
    postalCode: "",
    country: SHIPPING_COUNTRY,
  });
  const [items, setItems] = useState<OrderLineItem[]>([
    { productId: "", name: "", size: "M", quantity: 1, price: 0 },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [productQueryByRow, setProductQueryByRow] = useState<Record<number, string>>({});

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, i) =>
          sum + (Number(i.price) || 0) * Math.max(0, Math.floor(Number(i.quantity) || 0)),
        0
      ),
    [items]
  );
  const shippingCost = subtotal >= CURRENCY.freeShippingThreshold ? 0 : CURRENCY.shippingCost;
  const total = subtotal + shippingCost;
  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  function updateItem<K extends keyof OrderLineItem>(idx: number, key: K, value: OrderLineItem[K]) {
    setItems((prev) => prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)));
  }

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

  function addRow() {
    setItems((prev) => [...prev, { productId: "", name: "", size: "M", quantity: 1, price: 0 }]);
  }

  function removeRow(idx: number) {
    const ok = window.confirm("Remove this item row?");
    if (!ok) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
    setProductQueryByRow((prev) => {
      const next: Record<number, string> = {};
      for (const [k, v] of Object.entries(prev)) {
        const i = Number(k);
        if (i === idx) continue;
        next[i < idx ? i : i - 1] = v;
      }
      return next;
    });
  }

  async function submit() {
    setError(null);
    setPending(true);
    const res = await createOrderAdmin({
      customer_name: customerName,
      customer_email: customerEmail,
      shipping_address: shipping,
      line_items: items,
    });
    setPending(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.order_id) {
      router.push(`/admin/orders/${res.order_id}`);
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>
      )}

      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Customer</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">Name</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)]"
              placeholder="Customer name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">Email</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)]"
              placeholder="customer@example.com"
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Shipping address</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">Address</label>
            <input
              value={shipping.address}
              onChange={(e) => setShipping((s) => ({ ...s, address: e.target.value }))}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)]"
              placeholder="Street address"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]">City</label>
              <input
                value={shipping.city}
                onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))}
                className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]">Postal code</label>
              <input
                value={shipping.postalCode}
                onChange={(e) => setShipping((s) => ({ ...s, postalCode: e.target.value }))}
                className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]">Country</label>
              <input
                value={shipping.country}
                onChange={(e) => setShipping((s) => ({ ...s, country: e.target.value }))}
                className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Items</h2>
          <button
            type="button"
            onClick={addRow}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
          >
            + Add row
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {items.map((item, i) => {
            const selectedProduct = productsById.get(item.productId);
            const fitOptions = selectedProduct?.fits ?? [];
            const colorOptions = selectedProduct?.colors ?? [];
            const sizeOptions = selectedProduct?.sizes ?? ["M"];
            const previewImage = item.image || selectedProduct?.image || "";
            const searchQ = productQueryByRow[i] ?? "";
            const filtered = filterAdminProductsForSearch(products, searchQ);
            return (
            <div key={i} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
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
                      className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
                    />
                    {searchQ.trim() !== "" && filtered.length > 0 ? (
                      <ul
                        className="mt-1 max-h-36 overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--card)] text-sm shadow-md"
                        role="listbox"
                      >
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
                      className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
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
                        onChange={(e) => updateItem(i, "color", e.target.value || undefined)}
                        className="rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
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
                        className="rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
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
                      onChange={(e) => updateItem(i, "size", e.target.value)}
                      className="rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm sm:col-span-2"
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
                        onChange={(e) => updateItem(i, "price", Number(e.target.value) || 0)}
                        placeholder="Unit price"
                        className="rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
                      />
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={Math.max(1, Math.floor(Number(item.quantity) || 1))}
                        onChange={(e) =>
                          updateItem(i, "quantity", Math.max(1, Math.floor(Number(e.target.value) || 1)))
                        }
                        placeholder="Qty"
                        className="rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-[var(--muted)]">
                  Line total: Rs. {((Number(item.price) || 0) * Math.max(0, Math.floor(Number(item.quantity) || 0))).toFixed(2)}
                </p>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeRow(i)} className="text-xs text-red-500 hover:underline">
                    Remove row
                  </button>
                )}
              </div>
            </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Totals</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">Subtotal</dt>
            <dd className="font-medium">Rs. {subtotal.toFixed(2)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">Shipping</dt>
            <dd className="font-medium">{shippingCost === 0 ? "Free" : `Rs. ${shippingCost.toFixed(2)}`}</dd>
          </div>
          <div className="flex justify-between border-t border-[var(--border)] pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd>Rs. {total.toFixed(2)}</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="mt-4 w-full rounded-md bg-[var(--foreground)] py-3 text-sm font-semibold text-[var(--background)] hover:bg-[var(--accent)] disabled:opacity-60"
        >
          {pending ? "Creating..." : "Create order"}
        </button>
      </section>
    </div>
  );
}

