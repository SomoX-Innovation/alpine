"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem, ProductFit } from "@/lib/types";

function cartLineCap(item: Pick<CartItem, "maxQuantity">): number {
  return item.maxQuantity ?? 99;
}

function sameCartLine(
  a: Pick<CartItem, "productId" | "size" | "fit" | "color">,
  b: Pick<CartItem, "productId" | "size" | "fit" | "color">
) {
  return (
    a.productId === b.productId &&
    a.size === b.size &&
    (a.fit ?? "") === (b.fit ?? "") &&
    (a.color ?? "") === (b.color ?? "")
  );
}

type CartContextValue = {
  items: CartItem[];
  count: number;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, size: string, fit?: ProductFit, color?: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number, fit?: ProductFit, color?: string) => void;
  updateItemOptions: (
    oldLine: Pick<CartItem, "productId" | "size" | "fit" | "color">,
    nextLine: Pick<CartItem, "size" | "fit" | "color" | "image"> & {
      price?: number;
      priceOversize?: number | null;
      maxQuantity?: number;
    }
  ) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "alpine-cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveCart(items);
  }, [items, mounted]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      const requested = item.quantity ?? 1;
      setItems((prev) => {
        const i = prev.findIndex((x) => sameCartLine(x, item));
        if (i >= 0) {
          const next = [...prev];
          const cap = cartLineCap(next[i]);
          next[i] = {
            ...next[i],
            quantity: Math.min(cap, next[i].quantity + requested),
          };
          return next;
        }
        const cap = cartLineCap(item);
        if (cap < 1) return prev;
        const qty = Math.min(cap, Math.max(1, requested));
        return [...prev, { ...item, quantity: qty }];
      });
    },
    []
  );

  const removeItem = useCallback((productId: string, size: string, fit?: ProductFit, color?: string) => {
    setItems((prev) =>
      prev.filter(
        (x) => !sameCartLine(x, { productId, size, fit, color })
      )
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, size: string, quantity: number, fit?: ProductFit, color?: string) => {
      if (quantity < 1) {
        removeItem(productId, size, fit, color);
        return;
      }
      setItems((prev) =>
        prev.map((x) => {
          if (!sameCartLine(x, { productId, size, fit, color })) return x;
          const cap = cartLineCap(x);
          const q = Math.min(cap, Math.max(1, Math.floor(quantity)));
          return { ...x, quantity: q };
        })
      );
    },
    [removeItem]
  );

  const updateItemOptions = useCallback(
    (
      oldLine: Pick<CartItem, "productId" | "size" | "fit" | "color">,
      nextLine: Pick<CartItem, "size" | "fit" | "color" | "image"> & {
        price?: number;
        priceOversize?: number | null;
        maxQuantity?: number;
      }
    ) => {
      setItems((prev) => {
        const fromIndex = prev.findIndex((x) => sameCartLine(x, oldLine));
        if (fromIndex < 0) return prev;

        const current = prev[fromIndex];
        const pricingPatch =
          nextLine.price !== undefined
            ? {
                price: nextLine.price,
                priceOversize: nextLine.priceOversize ?? null,
              }
            : {};
        const maxPatch =
          nextLine.maxQuantity !== undefined ? { maxQuantity: nextLine.maxQuantity } : {};
        let updated: CartItem = {
          ...current,
          size: nextLine.size,
          fit: nextLine.fit,
          color: nextLine.color,
          image: nextLine.image,
          ...pricingPatch,
          ...maxPatch,
        };
        const cap = cartLineCap(updated);
        if (updated.quantity > cap) {
          updated = { ...updated, quantity: cap };
        }

        const toIndex = prev.findIndex((x, i) => i !== fromIndex && sameCartLine(x, updated));
        if (toIndex < 0) {
          const next = [...prev];
          next[fromIndex] = updated;
          return next;
        }

        // Merge quantities if edited options match another existing line.
        const mergeCap = Math.min(cartLineCap(prev[toIndex]), cartLineCap(updated));
        const next = [...prev];
        next[toIndex] = {
          ...next[toIndex],
          quantity: Math.min(mergeCap, next[toIndex].quantity + updated.quantity),
        };
        next.splice(fromIndex, 1);
        return next;
      });
    },
    []
  );

  const clearCart = useCallback(() => setItems([]), []);

  const count = useMemo(
    () => items.reduce((acc, i) => acc + i.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      count,
      addItem,
      removeItem,
      updateQuantity,
      updateItemOptions,
      clearCart,
    }),
    [items, count, addItem, removeItem, updateQuantity, updateItemOptions, clearCart]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (ctx) return ctx;
  return {
    items: [],
    count: 0,
    addItem: () => {},
    removeItem: () => {},
    updateQuantity: () => {},
    updateItemOptions: () => {},
    clearCart: () => {},
  };
}
