import { describe, expect, it } from 'vitest';
import { maxSharesForAmount, orderTotalCents } from './orders';

describe('maxSharesForAmount', () => {
  it('floors to whole shares', () => {
    expect(maxSharesForAmount(100000, 4572)).toBe(21); // 1000 ARS at 45.72 → 21 shares (960.12)
    expect(maxSharesForAmount(4572, 4572)).toBe(1);
    expect(maxSharesForAmount(4571, 4572)).toBe(0);
  });
  it('is zero for a missing price or amount', () => {
    expect(maxSharesForAmount(100000, 0)).toBe(0);
    expect(maxSharesForAmount(0, 4572)).toBe(0);
    expect(maxSharesForAmount(-5, 4572)).toBe(0);
  });
});

describe('orderTotalCents', () => {
  it('multiplies without float drift', () => {
    expect(orderTotalCents(3, 4572)).toBe(13716);
  });
});
