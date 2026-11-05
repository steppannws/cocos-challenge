/** Integer minor units (ARS cents). All arithmetic happens here, never on floats. */
export type Cents = number;

// API prices are floats (45.72). Converted once at the boundary (zod transform) and kept as cents.
export const toCents = (amount: number): Cents => Math.round(amount * 100);

export const fromCents = (cents: Cents): number => cents / 100;
