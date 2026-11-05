import type { Order } from '@/schemas/order';
import type { Cents } from './money';

// Spec: an ARS amount becomes the maximum number of whole shares at the last price; no fractions.
export const maxSharesForAmount = (amountCents: Cents, priceCents: Cents): number =>
  priceCents > 0 && amountCents > 0 ? Math.floor(amountCents / priceCents) : 0;

export const orderTotalCents = (quantity: number, priceCents: Cents): Cents =>
  quantity * priceCents;

type OrderState = Pick<Order, 'id' | 'status'>;

/** True when an order that was PENDING in `previous` is FILLED or REJECTED in `next`. */
export const hasSettled = (
  previous: readonly OrderState[],
  next: readonly OrderState[],
): boolean => {
  const pendingIds = new Set(previous.filter((o) => o.status === 'PENDING').map((o) => o.id));
  return next.some((o) => pendingIds.has(o.id) && o.status !== 'PENDING');
};

/** Consecutive items with the same day label form one section. Expects items already sorted. */
export const groupByDay = <T extends { createdAt: string }>(
  items: readonly T[],
  dayOf: (iso: string) => string,
): { title: string; data: T[] }[] => {
  const sections: { title: string; data: T[] }[] = [];
  for (const item of items) {
    const title = dayOf(item.createdAt);
    const last = sections.at(-1);
    if (last && last.title === title) {
      last.data.push(item);
    } else {
      sections.push({ title, data: [item] });
    }
  }
  return sections;
};
