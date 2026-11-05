import { describe, expect, it } from 'vitest';
import { groupByDay, hasSettled, maxSharesForAmount, orderTotalCents } from './orders';

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

describe('hasSettled', () => {
  const pending = { id: '1', status: 'PENDING' } as const;
  it('is true when a pending order filled or was rejected', () => {
    expect(hasSettled([pending], [{ id: '1', status: 'FILLED' }])).toBe(true);
    expect(hasSettled([pending], [{ id: '1', status: 'REJECTED' }])).toBe(true);
  });
  it('is false while it is still pending or for new orders', () => {
    expect(hasSettled([pending], [pending])).toBe(false);
    expect(hasSettled([], [{ id: '2', status: 'FILLED' }])).toBe(false);
  });
});

describe('groupByDay', () => {
  it('starts a section each time the day label changes', () => {
    const items = [
      { id: 'a', createdAt: '2026-11-05T10:00:00Z' },
      { id: 'b', createdAt: '2026-11-05T09:00:00Z' },
      { id: 'c', createdAt: '2026-11-04T23:00:00Z' },
    ];
    const sections = groupByDay(items, (iso) => iso.slice(0, 10));
    expect(sections.map((s) => [s.title, s.data.map((i) => i.id)])).toEqual([
      ['2026-11-05', ['a', 'b']],
      ['2026-11-04', ['c']],
    ]);
  });
  it('returns no sections for no items', () => {
    expect(groupByDay([], (iso) => iso)).toEqual([]);
  });
});
