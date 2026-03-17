"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { createClient } from "@/lib/supabase";
import { uploadProductImage } from "../actions/products";
import { updateDtfItems } from "../actions/settings";

type Gender = "Male" | "Female" | "Unisex";
type DtfRow = { code: string; url: string; genders: Gender[] };

export default function AdminDtfPage() {
  const [rows, setRows] = useState<DtfRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalCode, setModalCode] = useState("");
  const [modalFile, setModalFile] = useState<File | null>(null);
  const [modalUploading, setModalUploading] = useState(false);
  const [modalGenders, setModalGenders] = useState<Gender[]>(["Unisex"]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [filterGenders, setFilterGenders] = useState<Gender[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "dtf_items")
        .single();

      if (data?.value) {
        try {
          const parsed = JSON.parse(data.value);
          if (Array.isArray(parsed)) {
            setRows(
              parsed.map((item: any) => {
                const rawGender = item?.gender;
                const rawGenders = item?.genders;
                const source: string[] = Array.isArray(rawGenders)
                  ? rawGenders.map((g: any) => String(g ?? "").trim())
                  : typeof rawGender === "string"
                  ? [rawGender.trim()]
                  : [];

                const gendersSet = new Set<Gender>();
                for (const g of source) {
                  if (g === "Male" || g === "Female" || g === "Unisex") {
                    gendersSet.add(g);
                  }
                }
                if (gendersSet.size === 0) gendersSet.add("Unisex");

                return {
                  code: String(item?.code ?? ""),
                  url: String(item?.url ?? ""),
                  genders: Array.from(gendersSet),
                };
              })
            );
          } else {
            setRows([]);
          }
        } catch {
          setRows([]);
        }
      } else {
        setRows([]);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function persist(next: DtfRow[]) {
    setError(null);
    setSuccess(false);
    const cleaned = next
      .map((r) => {
        const genders =
          r.genders && r.genders.length > 0 ? r.genders : (["Unisex"] as Gender[]);
        return {
          code: r.code.trim(),
          url: r.url.trim(),
          genders,
        };
      })
      .filter((r) => r.code || r.url);
    const res = await updateDtfItems(cleaned);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      setRows(cleaned);
    }
  }

  async function handleDelete(index: number) {
    const next = rows.filter((_, i) => i !== index);
    await persist(next);
  }

  function openModal() {
    setModalCode("");
    setModalFile(null);
    setModalGenders(["Unisex"]);
    setEditingIndex(null);
    setModalOpen(true);
    setError(null);
    setSuccess(false);
  }

  function closeModal() {
    if (modalUploading) return;
    setModalOpen(false);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setModalFile(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const baseCode = modalCode.trim();
    const index = editingIndex;

    // If creating new, require a file
    if (index == null && !modalFile) {
      setError("Please choose an image file.");
      return;
    }

    let imageUrl: string | null = null;

    if (modalFile) {
      setModalUploading(true);
      const formData = new FormData();
      formData.set("file", modalFile);
      const res = await uploadProductImage(formData);
      setModalUploading(false);
      if (res.error) {
        setError(res.error);
        return;
      }
      if (!res.url) {
        setError("Failed to get uploaded image URL.");
        return;
      }
      imageUrl = res.url;
    }

    let next: DtfRow[];
    const genders =
      modalGenders.length > 0 ? modalGenders : (["Unisex"] as Gender[]);

    if (index == null) {
      // Create
      next = [
        ...rows,
        {
          code: baseCode,
          url: imageUrl!,
          genders,
        },
      ];
    } else {
      // Edit existing
      next = rows.map((row, i) =>
        i === index
          ? {
              code: baseCode || row.code,
              url: imageUrl ?? row.url,
              genders,
            }
          : row
      );
    }

    await persist(next);
    setModalOpen(false);
    setEditingIndex(null);
  }

  if (loading) {
    return <div className="text-[var(--muted)]">Loading DTF entries...</div>;
  }

  const visibleRows =
    filterGenders.length === 0
      ? rows.map((row, index) => ({ row, index }))
      : rows
          .map((row, index) => ({ row, index }))
          .filter(({ row }) => row.genders.some((g) => filterGenders.includes(g)));

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
            DTF codes
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Manage DTF entries. Each card shows a DTF code and its image.
          </p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] hover:bg-[var(--accent)]"
        >
          + Add DTF
        </button>
      </div>

      <div className="mt-6 max-w-5xl space-y-4">
        {error && (
          <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-500">
            Changes saved.
          </p>
        )}

        {rows.length === 0 && (
          <p className="text-sm text-[var(--muted)]">
            No DTF entries yet. Click &quot;Add DTF&quot; to create one.
          </p>
        )}

        {rows.length > 0 && (
          <>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-[var(--muted)]">Filter by gender:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFilterGenders([])}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    filterGenders.length === 0
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "bg-[var(--muted-bg)] text-[var(--muted)] hover:bg-[var(--foreground)]/10"
                  }`}
                >
                  All
                </button>
                {(["Male", "Female", "Unisex"] as Gender[]).map((g) => {
                  const active = filterGenders.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() =>
                        setFilterGenders((prev) =>
                          prev.includes(g)
                            ? prev.filter((x) => x !== g)
                            : [...prev, g]
                        )
                      }
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        active
                          ? "bg-[var(--foreground)] text-[var(--background)]"
                          : "bg-[var(--muted-bg)] text-[var(--muted)] hover:bg-[var(--foreground)]/10"
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-3 lg:grid-cols-4">
              {visibleRows.map(({ row, index }) => (
              <div
                key={`${row.code}-${index}`}
                className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  className="absolute right-2 top-2 z-10 rounded-full bg-black/50 px-1.5 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Delete DTF"
                >
                  ✕
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalCode(row.code);
                    setModalFile(null);
                    setModalGenders(row.genders);
                    setEditingIndex(index);
                    setModalOpen(true);
                    setError(null);
                    setSuccess(false);
                  }}
                  className="absolute left-2 top-2 z-10 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  Edit
                </button>
                <div className="bg-[var(--muted-bg)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {row.url ? (
                    <img
                      src={row.url}
                      alt={row.code || "DTF design"}
                      className="h-auto w-full object-contain"
                    />
                  ) : (
                    <div className="flex w-full items-center justify-center py-10 text-xs text-[var(--muted)]">
                      No image
                    </div>
                  )}
                </div>
                <div className="border-t border-[var(--border)] px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-[var(--foreground)]">
                      {row.code || "DTF code"}
                    </p>
                    <span className="whitespace-nowrap rounded-full bg-[var(--muted-bg)] px-2 py-0.5 text-xs font-medium text-[var(--muted)]">
                      {row.genders.join(" / ")}
                    </span>
                  </div>
                </div>
              </div>
              ))}
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl">
            <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
              {editingIndex == null ? "Add DTF" : "Edit DTF"}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Enter DTF code and upload an image from your computer.
            </p>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                  DTF code
                </label>
                <input
                  type="text"
                  value={modalCode}
                  onChange={(e) => setModalCode(e.target.value)}
                  className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
                  placeholder="e.g. A4-12345"
                  disabled={modalUploading}
                />
              </div>
              <div>
                <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                  Gender
                </span>
                <div className="flex flex-wrap gap-3 text-sm">
                  {(["Male", "Female", "Unisex"] as Gender[]).map((g) => (
                    <label
                      key={g}
                      className="inline-flex cursor-pointer items-center gap-1.5"
                    >
                      <input
                        type="checkbox"
                        checked={modalGenders.includes(g)}
                        onChange={() => {
                          setModalGenders((prev) => {
                            const has = prev.includes(g);
                            if (has) {
                              const next = prev.filter((x) => x !== g);
                              return next.length > 0 ? next : [];
                            }
                            return [...prev, g];
                          });
                        }}
                        className="h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                        disabled={modalUploading}
                      />
                      <span className="text-[var(--foreground)]">{g}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                  Image file
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-[var(--muted)]"
                  disabled={modalUploading}
                />
                {modalUploading && (
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Uploading…
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={modalUploading}
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted-bg)] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalUploading}
                  className="rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] hover:bg-[var(--accent)] disabled:opacity-50"
                >
                  {modalUploading
                    ? "Saving…"
                    : editingIndex == null
                    ? "Add DTF"
                    : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

