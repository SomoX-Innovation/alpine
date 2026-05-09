"use client";

import { useEffect, useMemo, useState } from "react";
import { variantInventoryKey, type ProductFit } from "@/lib/types";

type Props = {
  fits: ProductFit[];
  sizes: string[];
  colors: string[];
  initialJson: Record<string, number>;
  /** When false, submits empty variant map (legacy pool only). */
  enabled: boolean;
};

function buildKeys(fits: ProductFit[], sizes: string[], colors: string[]): string[] {
  const fitsEff: string[] = fits.length > 0 ? fits : ["_"];
  const sz = sizes.length > 0 ? sizes : ["_"];
  const cols = colors.length > 0 ? colors : [""];
  const list: string[] = [];
  for (const f of fitsEff) {
    for (const s of sz) {
      for (const c of cols) {
        list.push(variantInventoryKey(f === "_" ? undefined : f, s, c || undefined));
      }
    }
  }
  return list;
}

function humanLabel(key: string): string {
  const [f, s, c] = key.split("|");
  const parts: string[] = [];
  if (f !== "_") parts.push(f);
  parts.push(`Size ${s === "_" ? "—" : s}`);
  if (c !== "_") parts.push(c);
  return parts.join(" · ");
}

function parseKeyParts(key: string): { fit: string; size: string; color: string } {
  const [fit = "_", size = "_", color = "_"] = key.split("|");
  return { fit, size, color };
}

export default function VariantStockEditor({ fits, sizes, colors, initialJson, enabled }: Props) {
  const keys = useMemo(() => buildKeys(fits, sizes, colors), [fits, sizes, colors]);
  const keysSig = useMemo(() => keys.join("\0"), [keys]);
  const initialSer = useMemo(() => JSON.stringify(initialJson), [initialJson]);

  const [map, setMap] = useState<Record<string, number>>({});
  const [fitDraft, setFitDraft] = useState<Record<string, string>>({});
  const [colorDraft, setColorDraft] = useState<Record<string, string>>({});
  const [allDraft, setAllDraft] = useState("");

  useEffect(() => {
    let parsed: Record<string, number> = {};
    try {
      parsed = JSON.parse(initialSer) as Record<string, number>;
    } catch {
      parsed = {};
    }
    const m: Record<string, number> = {};
    for (const k of keys) {
      m[k] = Math.max(0, Math.floor(Number(parsed[k]) || 0));
    }
    setMap(m);
  }, [keysSig, initialSer]);

  function setQty(key: string, v: number) {
    const n = Math.max(0, Math.floor(v) || 0);
    setMap((prev) => ({ ...prev, [key]: n }));
  }

  function applyToFitPrefix(fitPrefix: string, qty: number) {
    const n = Math.max(0, Math.floor(qty) || 0);
    setMap((prev) => {
      const next = { ...prev };
      for (const k of keys) {
        const { fit } = parseKeyParts(k);
        if (fit === fitPrefix) next[k] = n;
      }
      return next;
    });
  }

  function applyToColorName(colorName: string, qty: number) {
    const n = Math.max(0, Math.floor(qty) || 0);
    const want = colorName.trim() ? colorName.trim() : "_";
    setMap((prev) => {
      const next = { ...prev };
      for (const k of keys) {
        const { color } = parseKeyParts(k);
        if (color === want) next[k] = n;
      }
      return next;
    });
  }

  function applyToAllRows(qty: number) {
    const n = Math.max(0, Math.floor(qty) || 0);
    setMap((prev) => {
      const next = { ...prev };
      for (const k of keys) next[k] = n;
      return next;
    });
  }

  const fitQuickList: (ProductFit | "_")[] =
    fits.length > 0 ? fits : keys.some((k) => parseKeyParts(k).fit === "_") ? ["_"] : [];

  return (
    <>
      <input
        type="hidden"
        name="variant_stock_json"
        value={enabled ? JSON.stringify(map) : "{}"}
        readOnly
      />
      {enabled && keys.length > 0 && (
        <>
          <div className="mt-3 space-y-4 rounded-md border border-[var(--border)] bg-[var(--muted-bg)]/40 p-3">
            <p className="text-xs text-[var(--foreground)]">
              <span className="font-medium">Quick set quantities</span> — each number is applied to{" "}
              <em>every</em> variant row that matches (every size × color under that fit, or every fit × size
              under that color). If you use both fit and color quick sets, a later Apply overwrites the same
              cell — use the table to set exact numbers per row.
            </p>

            {fitQuickList.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-[var(--muted)]">By fit</p>
                <div className="flex flex-wrap gap-3">
                  {fitQuickList.map((f) => {
                    const label = f === "_" ? "No fit (single bucket)" : f;
                    return (
                      <div key={f} className="flex items-end gap-2">
                        <label className="text-xs text-[var(--foreground)]">
                          <span className="mb-0.5 block text-[var(--muted)]">{label}</span>
                          <input
                            type="number"
                            min={0}
                            step={1}
                            value={fitDraft[f] ?? ""}
                            placeholder="0"
                            onChange={(e) => setFitDraft((d) => ({ ...d, [f]: e.target.value }))}
                            className="w-20 rounded border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-[var(--foreground)]"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => applyToFitPrefix(f, Number(fitDraft[f]))}
                          className="rounded border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                        >
                          Apply
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {colors.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-[var(--muted)]">By color</p>
                <div className="flex flex-wrap gap-3">
                  {colors.map((c) => (
                    <div key={c} className="flex items-end gap-2">
                      <label className="text-xs text-[var(--foreground)]">
                        <span className="mb-0.5 block text-[var(--muted)]">{c}</span>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={colorDraft[c] ?? ""}
                          placeholder="0"
                          onChange={(e) =>
                            setColorDraft((d) => ({
                              ...d,
                              [c]: e.target.value,
                            }))
                          }
                          className="w-20 rounded border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-[var(--foreground)]"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => applyToColorName(c, Number(colorDraft[c]))}
                        className="rounded border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-end gap-2 border-t border-[var(--border)] pt-3">
              <label className="text-xs text-[var(--foreground)]">
                <span className="mb-0.5 block text-[var(--muted)]">Set every row to</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={allDraft}
                  placeholder="0"
                  onChange={(e) => setAllDraft(e.target.value)}
                  className="w-24 rounded border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-[var(--foreground)]"
                />
              </label>
              <button
                type="button"
                onClick={() => applyToAllRows(Number(allDraft))}
                className="rounded border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted-bg)]"
              >
                Apply to all
              </button>
            </div>
          </div>

          <div className="mt-3 max-h-96 overflow-auto rounded-md border border-[var(--border)]">
            <table className="w-full min-w-[28rem] text-sm">
              <thead className="sticky top-0 bg-[var(--muted-bg)]">
                <tr className="border-b border-[var(--border)] text-left">
                  <th className="px-3 py-2 font-medium text-[var(--foreground)]">Variant (fit · size · color)</th>
                  <th className="w-28 px-3 py-2 font-medium text-[var(--foreground)]">Qty</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-3 py-2 text-[var(--muted)]">{humanLabel(k)}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={map[k] ?? 0}
                        onChange={(e) => setQty(k, Number(e.target.value))}
                        className="w-full rounded border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[var(--foreground)]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
