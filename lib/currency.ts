/** Only country we ship to (checkout address). */
export const SHIPPING_COUNTRY = "Sri Lanka";

/** Currency configuration (LKR = Sri Lankan Rupees) */
export const CURRENCY = {
  symbol: "Rs.",
  code: "LKR",
  format: (amount: number) => `Rs. ${amount.toFixed(2)}`,
  freeShippingThreshold: 5000,
  shippingCost: 300,
};
