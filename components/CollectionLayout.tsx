"use client";

import { useState, useMemo, useCallback, memo } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";
import type { ProductCategory } from "@/lib/types";

type SortOption = "featured" | "price-asc" | "price-desc" | "newest";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

const BADGES = ["New", "Sale"] as const;

type FilterPanelProps = {
  showCategoryFilter: boolean;
  availableCategories: ProductCategory[];
  selectedCategories: Set<ProductCategory>;
  toggleCategory: (c: ProductCategory) => void;
  priceMinMax: { min: number; max: number };
  priceMin: number;
  priceMax: number;
  priceRange: { min: number; max: number } | null;
  setPriceBarMin: (v: number | null) => void;
  setPriceBarMax: (v: number | null) => void;
  priceBarMin: number | null;
  priceBarMax: number | null;
  availableColors: string[];
  selectedColors: Set<string>;
  toggleColor: (color: string) => void;
  selectedBadges: Set<string>;
  toggleBadge: (badge: string) => void;
  activeFilterCount: number;
  clearAllFilters: () => void;
};

const FilterPanel = memo(function FilterPanel({
  showCategoryFilter,
  availableCategories,
  selectedCategories,
  toggleCategory,
  priceMinMax,
  priceMin,
  priceMax,
  priceBarMin,
  priceBarMax,
  priceRange,
  setPriceBarMin,
  setPriceBarMax,
  availableColors,
  selectedColors,
  toggleColor,
  selectedBadges,
  toggleBadge,
  activeFilterCount,
  clearAllFilters,
}: FilterPanelProps) {
  return (
    <div className="space-y-6">
      {showCategoryFilter && availableCategories.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Category</h3>
          <ul className="mt-2 space-y-1.5">
            {availableCategories.map((c) => (
              <li key={c}>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--muted)]">
                  <input
                    type="checkbox"
                    checked={selectedCategories.size === 0 ? true : selectedCategories.has(c)}
                    onChange={() => toggleCategory(c)}
                    className="h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                  />
                  {c}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Price</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {priceRange
            ? `€${priceMin} – €${priceMax}`
            : `€${priceMinMax.min} – €${priceMinMax.max}`}
        </p>
        <div className="mt-3 space-y-3">
          <div className="relative h-8">
            <div className="absolute top-3 left-0 right-0 h-1.5 rounded-full bg-[var(--border)]" />
            <div
              className="absolute top-3 h-1.5 rounded-full bg-[var(--accent)]"
              style={{
                left: `${((priceMin - priceMinMax.min) / ((priceMinMax.max - priceMinMax.min) || 1)) * 100}%`,
                width: `${((priceMax - priceMin) / ((priceMinMax.max - priceMinMax.min) || 1)) * 100}%`,
              }}
            />
            <input
              type="range"
              min={priceMinMax.min}
              max={priceMinMax.max}
              step={1}
              value={Math.min(priceMin, priceMax - 1)}
              aria-label="Minimum price"
              onChange={(e) => {
                const v = Number(e.target.value);
                setPriceBarMin(v);
                if (priceBarMax !== null && v >= priceBarMax) setPriceBarMax(v);
              }}
              className="absolute left-0 right-0 top-0 h-8 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--card)] [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:shadow-md"
            />
            <input
              type="range"
              min={priceMinMax.min}
              max={priceMinMax.max}
              step={1}
              value={Math.max(priceMax, priceMin + 1)}
              onChange={(e) => {
                const v = Number(e.target.value);
                setPriceBarMax(v);
                if (priceBarMin !== null && v <= priceBarMin) setPriceBarMin(v);
              }}
              aria-label="Maximum price"
              className="absolute left-0 right-0 top-0 h-8 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--card)] [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:shadow-md"
            />
          </div>
          <div className="flex justify-between text-xs text-[var(--muted)]">
            <span>€{priceMinMax.min}</span>
            <span>€{priceMinMax.max}</span>
          </div>
        </div>
      </div>

      {availableColors.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Color</h3>
          <ul className="mt-2 space-y-1.5">
            {availableColors.map((color) => (
              <li key={color}>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--muted)]">
                  <input
                    type="checkbox"
                    checked={selectedColors.has(color)}
                    onChange={() => toggleColor(color)}
                    className="h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                  />
                  {color}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Label</h3>
        <ul className="mt-2 space-y-1.5">
          {BADGES.map((badge) => (
            <li key={badge}>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--muted)]">
                <input
                  type="checkbox"
                  checked={selectedBadges.has(badge)}
                  onChange={() => toggleBadge(badge)}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                />
                {badge}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="text-sm font-medium text-[var(--accent)] hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
});

function sortProducts(products: Product[], sort: SortOption): Product[] {
  const arr = [...products];
  switch (sort) {
    case "price-asc":
      return arr.sort((a, b) => a.price - b.price);
    case "price-desc":
      return arr.sort((a, b) => b.price - a.price);
    case "newest":
      return arr.sort((a, b) => (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0));
    default:
      return arr;
  }
}

function getUniqueColors(products: Product[]): string[] {
  const set = new Set<string>();
  products.forEach((p) => p.color && set.add(p.color));
  return Array.from(set).sort();
}

type CollectionLayoutProps = {
  title: string;
  description?: string;
  products: Product[];
  /** If true, show category filter (for mixed collections) */
  showCategoryFilter?: boolean;
};

export default function CollectionLayout({
  title,
  description,
  products,
  showCategoryFilter = true,
}: CollectionLayoutProps) {
  const [sort, setSort] = useState<SortOption>("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<Set<ProductCategory>>(new Set());
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [selectedBadges, setSelectedBadges] = useState<Set<string>>(new Set());

  const availableColors = useMemo(() => getUniqueColors(products), [products]);
  const availableCategories = useMemo(() => {
    const set = new Set<ProductCategory>();
    products.forEach((p) => set.add(p.category));
    return Array.from(set).sort();
  }, [products]);
  const priceMinMax = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 100 };
    const prices = products.map((p) => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  const [priceBarMin, setPriceBarMin] = useState<number | null>(null);
  const [priceBarMax, setPriceBarMax] = useState<number | null>(null);
  const priceMin = priceBarMin ?? priceMinMax.min;
  const priceMax = priceBarMax ?? priceMinMax.max;
  const priceRange =
    priceMin > priceMinMax.min || priceMax < priceMinMax.max
      ? { min: priceMin, max: priceMax }
      : null;

  const filtered = useMemo(() => {
    let result = products;

    if (showCategoryFilter && selectedCategories.size > 0) {
      result = result.filter((p) => selectedCategories.has(p.category));
    }

    if (priceRange) {
      result = result.filter((p) => p.price >= priceRange.min && p.price <= priceRange.max);
    }

    if (selectedColors.size > 0) {
      result = result.filter((p) => p.color && selectedColors.has(p.color));
    }

    if (selectedBadges.size > 0) {
      result = result.filter((p) => p.badge && selectedBadges.has(p.badge));
    }

    return result;
  }, [
    products,
    showCategoryFilter,
    selectedCategories,
    priceRange,
    selectedColors,
    selectedBadges,
  ]);

  const sorted = useMemo(() => sortProducts(filtered, sort), [filtered, sort]);

  const activeFilterCount =
    (showCategoryFilter && selectedCategories.size > 0 ? 1 : 0) +
    (priceRange ? 1 : 0) +
    (selectedColors.size > 0 ? 1 : 0) +
    (selectedBadges.size > 0 ? 1 : 0);

  const clearAllFilters = useCallback(() => {
    setSelectedCategories(new Set());
    setPriceBarMin(null);
    setPriceBarMax(null);
    setSelectedColors(new Set());
    setSelectedBadges(new Set());
    setMobileFiltersOpen(false);
  }, []);

  const toggleCategory = useCallback(
    (c: ProductCategory) => {
      setSelectedCategories((prev) => {
        const next = new Set(prev);
        if (prev.size === 0) {
          availableCategories.filter((x) => x !== c).forEach((x) => next.add(x));
          return next;
        }
        if (next.has(c)) next.delete(c);
        else next.add(c);
        return next.size === 0 ? new Set() : next;
      });
    },
    [availableCategories]
  );

  const toggleColor = useCallback((color: string) => {
    setSelectedColors((prev) => {
      const next = new Set(prev);
      if (next.has(color)) next.delete(color);
      else next.add(color);
      return next;
    });
  }, []);

  const toggleBadge = useCallback((badge: string) => {
    setSelectedBadges((prev) => {
      const next = new Set(prev);
      if (next.has(badge)) next.delete(badge);
      else next.add(badge);
      return next;
    });
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-[var(--muted)]">{description}</p>
        )}
      </div>

      {/* Toolbar: filters button (mobile) + count + sort */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-[var(--foreground)] lg:hidden"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-[var(--background)]">
                {activeFilterCount}
              </span>
            )}
          </button>
          <p className="text-sm text-[var(--muted)]">
            {sorted.length} {sorted.length === 1 ? "product" : "products"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm font-medium text-[var(--foreground)]">
            Sort by
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <FilterPanel
              showCategoryFilter={showCategoryFilter}
              availableCategories={availableCategories}
              selectedCategories={selectedCategories}
              toggleCategory={toggleCategory}
              priceMinMax={priceMinMax}
              priceMin={priceMin}
              priceMax={priceMax}
              priceRange={priceRange}
              setPriceBarMin={setPriceBarMin}
              setPriceBarMax={setPriceBarMax}
              priceBarMin={priceBarMin}
              priceBarMax={priceBarMax}
              availableColors={availableColors}
              selectedColors={selectedColors}
              toggleColor={toggleColor}
              selectedBadges={selectedBadges}
              toggleBadge={toggleBadge}
              activeFilterCount={activeFilterCount}
              clearAllFilters={clearAllFilters}
            />
          </div>
        </aside>

        {/* Product grid */}
        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-3 lg:grid-cols-3">
            {sorted.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {sorted.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-[var(--muted)]">No products match your filters.</p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-3 text-sm font-medium text-[var(--accent)] hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filters overlay */}
      {mobileFiltersOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            aria-hidden
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-full max-w-sm overflow-y-auto border-r border-[var(--border)] bg-[var(--card)] p-6 shadow-xl lg:hidden">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-md p-2 text-[var(--muted)] hover:bg-[var(--muted-bg)]"
                aria-label="Close filters"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-6">
              <FilterPanel
                showCategoryFilter={showCategoryFilter}
                availableCategories={availableCategories}
                selectedCategories={selectedCategories}
                toggleCategory={toggleCategory}
                priceMinMax={priceMinMax}
                priceMin={priceMin}
                priceMax={priceMax}
                priceRange={priceRange}
                setPriceBarMin={setPriceBarMin}
                setPriceBarMax={setPriceBarMax}
                priceBarMin={priceBarMin}
                priceBarMax={priceBarMax}
                availableColors={availableColors}
                selectedColors={selectedColors}
                toggleColor={toggleColor}
                selectedBadges={selectedBadges}
                toggleBadge={toggleBadge}
                activeFilterCount={activeFilterCount}
                clearAllFilters={clearAllFilters}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
