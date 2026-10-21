// Shared, server-and-client-safe pricing calculations.
//
// Both the browser cart/checkout and the Vercel checkout API use these rules so
// displayed totals cannot drift from the server-authoritative totals. The server
// (`api/orders/create.ts`) independently recomputes every monetary value from
// the live catalog inside a Firestore transaction and is authoritative; this
// utility is only for consistent client-side display and pre-validation.

export type PricingInput = {
  price: number;
  discountPrice: number;
  qty: number;
};

export type PricingResult = {
  subtotal: number;
  discount: number;
  delivery: number;
  tax: number;
  total: number;
};

// Free delivery threshold (in INR, paise-free whole units matching the catalog).
export const FREE_DELIVERY_THRESHOLD = 50000;
export const STANDARD_DELIVERY = 499;

export function computeOrderTotals(lines: PricingInput[]): PricingResult {
  let subtotal = 0;
  let discounted = 0;
  for (const line of lines) {
    if (!Number.isFinite(line.price) || line.price < 0) {
      throw new Error("Invalid product price.");
    }
    if (!Number.isFinite(line.discountPrice) || line.discountPrice < 0) {
      throw new Error("Invalid product discount price.");
    }
    if (!Number.isInteger(line.qty) || line.qty < 1) {
      throw new Error("Invalid quantity.");
    }
    subtotal += line.price * line.qty;
    discounted += line.discountPrice * line.qty;
  }
  const discount = subtotal - discounted;
  const delivery = discounted > FREE_DELIVERY_THRESHOLD || discounted === 0 ? 0 : STANDARD_DELIVERY;
  const tax = 0;
  const total = discounted + delivery;
  return { subtotal, discount, delivery, tax, total };
}
