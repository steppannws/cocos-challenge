import type { Cents } from './money';

// Spec: an ARS amount becomes the maximum number of whole shares at the last price; no fractions.
export const maxSharesForAmount = (amountCents: Cents, priceCents: Cents): number =>
  priceCents > 0 && amountCents > 0 ? Math.floor(amountCents / priceCents) : 0;

export const orderTotalCents = (quantity: number, priceCents: Cents): Cents =>
  quantity * priceCents;
