/** Normalized order lifecycle for customer-facing UI */
export const ORDER_STEPS = [
  { key: "placed", label: "Order placed", description: "We received your order" },
  { key: "processing", label: "Processing", description: "We're preparing your items" },
  { key: "shipped", label: "Shipped", description: "On the way to you" },
  { key: "delivered", label: "Delivered", description: "Order completed" },
] as const;

export function getStatusDisplay(status: string): { label: string; tone: "default" | "success" | "warning" | "danger" } {
  const s = status.toLowerCase();
  switch (s) {
    case "pending":
      return { label: "Pending", tone: "warning" };
    case "paid":
      return { label: "Paid", tone: "success" };
    case "processing":
      return { label: "Processing", tone: "default" };
    case "shipped":
      return { label: "Shipped", tone: "success" };
    case "delivered":
      return { label: "Delivered", tone: "success" };
    case "cancelled":
      return { label: "Cancelled", tone: "danger" };
    default:
      return { label: status, tone: "default" };
  }
}

/** Per-step state for the 4-step timeline */
export type StepState = "complete" | "current" | "upcoming";

export function getStepStates(status: string): StepState[] | null {
  const s = status.toLowerCase();
  if (s === "cancelled") return null;
  if (s === "delivered") return ["complete", "complete", "complete", "complete"];
  if (s === "shipped") return ["complete", "complete", "complete", "current"];
  if (s === "processing") return ["complete", "complete", "current", "upcoming"];
  // pending, paid — order received, being prepared
  return ["complete", "current", "upcoming", "upcoming"];
}

export function isCancelled(status: string): boolean {
  return status.toLowerCase() === "cancelled";
}
