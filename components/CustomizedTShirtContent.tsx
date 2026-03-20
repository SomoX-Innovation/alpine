"use client";

import { useMemo, useState } from "react";
import { createCustomizedOrder, uploadDesignImage } from "@/app/actions/customized-orders";

type Placement = "Chest" | "Front" | "Back";
const placements: Placement[] = ["Chest", "Front", "Back"];
const sizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

const basePriceByCount: Record<number, number> = {
  1: 1680,
  2: 1980,
  3: 2480,
};

export default function CustomizedTShirtContent() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tshirtType, setTshirtType] = useState<"Regular" | "Oversize">("Regular");
  const [printSize, setPrintSize] = useState<"A4" | "A3">("A4");
  const [designUrls, setDesignUrls] = useState<Record<string, string>>({});
  const [sizeQty, setSizeQty] = useState<Record<string, number>>({});

  const selectedPlacements = useMemo(
    () => placements.filter((p) => (designUrls[p] ?? "").trim().length > 0),
    [designUrls]
  );

  const unitPrice = useMemo(() => {
    const byCount = basePriceByCount[Math.max(1, selectedPlacements.length)] ?? basePriceByCount[1];
    const a3Extra = printSize === "A3" ? 700 : 0;
    const oversizeExtra = tshirtType === "Oversize" ? 200 : 0;
    return byCount + a3Extra + oversizeExtra;
  }, [printSize, selectedPlacements.length, tshirtType]);

  const qtyTotal = useMemo(
    () => sizes.reduce((sum, s) => sum + (Number(sizeQty[s]) || 0), 0),
    [sizeQty]
  );

  const total = qtyTotal * unitPrice;

  async function onUpload(placement: Placement, file?: File) {
    if (!file) return;
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    const res = await uploadDesignImage(fd);
    setUploading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.url) {
      setDesignUrls((prev) => ({ ...prev, [placement]: res.url }));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (selectedPlacements.length === 0) {
      setError("Upload at least one DTF design (Chest, Front, or Back).");
      return;
    }
    if (qtyTotal <= 0) {
      setError("Add at least one quantity in sizes.");
      return;
    }

    const res = await createCustomizedOrder({
      customer_name: String(formData.get("customer_name") ?? ""),
      customer_email: String(formData.get("customer_email") ?? ""),
      customer_phone: String(formData.get("customer_phone") ?? ""),
      tshirt_type: tshirtType,
      print_size: printSize,
      placements: selectedPlacements,
      design_urls: designUrls,
      size_quantities: Object.fromEntries(
        Object.entries(sizeQty).filter(([, v]) => Number(v) > 0).map(([k, v]) => [k, Number(v)])
      ),
      quantity: qtyTotal,
      notes: String(formData.get("notes") ?? ""),
      total,
    });

    if (res.error) {
      setError(res.error);
      return;
    }
    setSuccess(`Order submitted. Reference: ${res.order_number}`);
    form.reset();
    setDesignUrls({});
    setSizeQty({});
    setTshirtType("Regular");
    setPrintSize("A4");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-[var(--foreground)]">Customized T Shirt</h1>
      <p className="mt-2 text-[var(--muted)]">
        Upload up to 3 DTF designs (Chest, Front, Back). Pricing chart generates automatically.
      </p>

      <div className="mt-8 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="font-display text-xl font-semibold text-[var(--foreground)]">Retail Price Chart</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-3 py-2 text-left">DTF Count</th>
                <th className="px-3 py-2 text-left">Base (A4)</th>
                <th className="px-3 py-2 text-left">A3 Price</th>
                <th className="px-3 py-2 text-left">Placements</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((count) => (
                <tr key={count} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-3 py-2">{count}</td>
                  <td className="px-3 py-2">Rs.{basePriceByCount[count].toFixed(2)}</td>
                  <td className="px-3 py-2">Rs.{(basePriceByCount[count] + 700).toFixed(2)}</td>
                  <td className="px-3 py-2 text-[var(--muted)]">
                    {count === 1 ? "Chest or Front or Back" : count === 2 ? "Any two positions" : "Chest + Front + Back"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}
        {success && <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-500">{success}</p>}

        <div className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">T-Shirt Type</label>
            <select
              value={tshirtType}
              onChange={(e) => setTshirtType(e.target.value as "Regular" | "Oversize")}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            >
              <option value="Regular">Regular</option>
              <option value="Oversize">Oversize</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">Print Size</label>
            <select
              value={printSize}
              onChange={(e) => setPrintSize(e.target.value as "A4" | "A3")}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            >
              <option value="A4">A4</option>
              <option value="A3">A3</option>
            </select>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Upload DTF Designs</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            {placements.map((p) => (
              <div key={p} className="rounded-md border border-[var(--border)] p-3">
                <p className="text-sm font-medium text-[var(--foreground)]">{p}</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onUpload(p, e.target.files?.[0])}
                  disabled={uploading}
                  className="mt-2 block w-full text-xs text-[var(--muted)]"
                />
                {designUrls[p] && <p className="mt-2 truncate text-xs text-[var(--muted)]">Uploaded</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Size Quantities</h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {sizes.map((s) => (
              <div key={s}>
                <label className="text-xs text-[var(--muted)]">{s}</label>
                <input
                  type="number"
                  min={0}
                  value={sizeQty[s] ?? 0}
                  onChange={(e) => setSizeQty((prev) => ({ ...prev, [s]: Math.max(0, Number(e.target.value) || 0) }))}
                  className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">Name *</label>
            <input name="customer_name" required className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">Email *</label>
            <input name="customer_email" type="email" required className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">Phone *</label>
            <input name="customer_phone" required className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">Notes</label>
            <input name="notes" className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" placeholder="Color, deadline, extra details" />
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-sm text-[var(--muted)]">
            Selected DTF positions: <span className="font-medium text-[var(--foreground)]">{selectedPlacements.join(", ") || "None"}</span>
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Qty: <span className="font-medium text-[var(--foreground)]">{qtyTotal}</span> · Unit Price:{" "}
            <span className="font-medium text-[var(--foreground)]">Rs.{unitPrice.toFixed(2)}</span>
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">Total: Rs.{total.toFixed(2)}</p>
        </div>

        <button
          type="submit"
          className="rounded-md bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-[var(--background)] hover:bg-[var(--accent)]"
        >
          Place Customized Order
        </button>
      </form>
    </div>
  );
}
