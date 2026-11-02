import { describe, expect, it } from 'vitest';
import { fromCents, toCents } from './money';

describe('money', () => {
  it('rounds float prices to integer cents', () => {
    expect(toCents(45.72)).toBe(4572);
    expect(toCents(0.1 + 0.2)).toBe(30);
    expect(toCents(1.005)).toBe(100); // 1.005 is 1.00499… in binary; the API never sends sub-cent prices
    expect(toCents(0)).toBe(0);
  });

  it('round-trips through fromCents', () => {
    expect(fromCents(toCents(84.5))).toBe(84.5);
  });
});
