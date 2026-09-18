/**
 * DEMO PRICE LIST — not supplied by initial.json, which carries no pricing at all.
 * Kept deliberately small (one fitted price per size, one flat discount) so the demo
 * can show how price changes the customer conversation without turning into a
 * catalogue. Every figure shown from here is labeled illustrative in the UI.
 */
export const DEMO_PRICE_PER_TYRE_MAD: Record<string, number> = {
  "205/55 R16": 780,
  "225/45 R17": 1150,
  "195/65 R15": 640,
  "215/60 R16": 890,
  "235/40 R18": 1390,
};

export const FALLBACK_PRICE_MAD = 800;

export const DISCOUNT_OPTIONS = [0, 5, 10, 15];

export function priceForSize(size: string): number {
  return DEMO_PRICE_PER_TYRE_MAD[size] ?? FALLBACK_PRICE_MAD;
}

export interface OfferPrice {
  unit: number;
  units: number;
  gross: number;
  discountPct: number;
  total: number;
  saved: number;
}

export function quoteFor(size: string, units: number, discountPct: number): OfferPrice {
  const unit = priceForSize(size);
  const qty = Math.max(1, units);
  const gross = unit * qty;
  const total = Math.round(gross * (1 - discountPct / 100));
  return { unit, units: qty, gross, discountPct, total, saved: gross - total };
}

export function formatMAD(amount: number): string {
  return `${amount.toLocaleString("en-US")} MAD`;
}
