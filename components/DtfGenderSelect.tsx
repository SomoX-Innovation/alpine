"use client";

import type { DtfGender } from "@/lib/settings-db";
import { useState, useMemo } from "react";

type Props = {
  items: { genders: DtfGender[] }[];
  onFilteredChange: (filtered: { genders: DtfGender[] }[]) => void;
};

const GENDERS: ("All" | DtfGender)[] = ["All", "Male", "Female", "Unisex"];

export function DtfGenderSelect({ items, onFilteredChange }: Props) {
  const [value, setValue] = useState<"All" | DtfGender>("All");

  const hasGender = useMemo(() => {
    const set = new Set<DtfGender>();
    items.forEach((it) => it.genders.forEach((g) => set.add(g)));
    return set;
  }, [items]);

  const available = GENDERS.filter(
    (g) => g === "All" || hasGender.has(g as DtfGender)
  );

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as "All" | DtfGender;
    setValue(next);
    const filtered =
      next === "All"
        ? items
        : items.filter((it) => it.genders.includes(next as DtfGender));
    onFilteredChange(filtered);
  }

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="dtf-gender"
        className="text-sm font-medium text-[var(--foreground)]"
      >
        Gender
      </label>
      <select
        id="dtf-gender"
        value={value}
        onChange={handleChange}
        className="rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
      >
        {available.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
    </div>
  );
}

