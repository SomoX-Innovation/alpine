"use client";

import dynamic from "next/dynamic";
import type { OrderLineItem } from "@/app/actions/orders";
import type { AdminOrderProduct } from "@/lib/admin-order-product-search";

const OrderItemsEditor = dynamic(() => import("./OrderItemsEditor"), {
  ssr: false,
});

export default function OrderItemsEditorClient({
  orderId,
  initialItems,
  products,
}: {
  orderId: string;
  initialItems: OrderLineItem[];
  products: AdminOrderProduct[];
}) {
  return <OrderItemsEditor orderId={orderId} initialItems={initialItems} products={products} />;
}
