import { describe, expect, it } from 'vitest';
import {
  deriveOrder,
  initialOrderValues,
  type OrderFormContext,
  parseDecimal,
  parseInteger,
  quickPicks,
} from './orderForm';

const ctx: OrderFormContext = {
  lastPriceCents: 4572,
  availableCashCents: 100000,
  availableShares: 5,
};
const buy = initialOrderValues('BUY');
const sell = initialOrderValues('SELL');

describe('parseDecimal', () => {
  it('accepts both decimal separators and grouped thousands', () => {
    expect(parseDecimal('84,5')).toBe(84.5);
    expect(parseDecimal('84.5')).toBe(84.5);
    expect(parseDecimal('1.234,56')).toBe(1234.56);
    expect(parseDecimal('1,234.56')).toBe(1234.56);
    expect(parseDecimal(' 100 ')).toBe(100);
  });
  it('reads one separator followed by groups of three digits as thousands', () => {
    // es-AR writes 1500 pesos as "1.500"; read as a decimal it became a 1,50 limit price.
    expect(parseDecimal('1.500')).toBe(1500);
    expect(parseDecimal('10.000.000')).toBe(10000000);
    expect(parseDecimal('1,500')).toBe(1500);
    expect(parseDecimal('0.500')).toBe(0.5);
    expect(parseDecimal('84.50')).toBe(84.5);
  });
  it('rejects garbage', () => {
    expect(parseDecimal('')).toBeNaN();
    expect(parseDecimal('abc')).toBeNaN();
    expect(parseDecimal('-5')).toBeNaN();
    expect(parseDecimal('1e3')).toBeNaN();
  });
});

describe('parseInteger', () => {
  it('only accepts whole numbers', () => {
    expect(parseInteger('12')).toBe(12);
    expect(parseInteger('1.5')).toBeNaN();
    expect(parseInteger('')).toBeNaN();
  });
});

describe('deriveOrder', () => {
  it('market buy by quantity', () => {
    const d = deriveOrder({ ...buy, quantity: '3' }, ctx);
    expect(d).toMatchObject({
      quantity: 3,
      unitPriceCents: 4572,
      totalCents: 13716,
      limitPriceCents: null,
      isValid: true,
    });
  });

  it('market buy by amount converts to whole shares at the last price', () => {
    const d = deriveOrder({ ...buy, mode: 'amount', amount: '1000' }, ctx);
    expect(d.quantity).toBe(21);
    expect(d.totalCents).toBe(21 * 4572);
    expect(d.isValid).toBe(true);
  });

  it('flags an amount that buys nothing', () => {
    expect(deriveOrder({ ...buy, mode: 'amount', amount: '10' }, ctx).errors.amount).toBe(
      'amountTooSmall',
    );
    expect(deriveOrder({ ...buy, mode: 'amount', amount: '0' }, ctx).errors.amount).toBe(
      'amountPositive',
    );
    expect(deriveOrder({ ...buy, mode: 'amount', amount: '' }, ctx).errors.amount).toBe(
      'amountPositive',
    );
  });

  it('flags a non-integer or empty quantity', () => {
    expect(deriveOrder({ ...buy, quantity: '' }, ctx).errors.quantity).toBe('quantityPositive');
    expect(deriveOrder({ ...buy, quantity: '2.5' }, ctx).errors.quantity).toBe(
      'quantityFractional',
    );
    expect(deriveOrder({ ...buy, quantity: '10,2' }, ctx).errors.quantity).toBe(
      'quantityFractional',
    );
    expect(deriveOrder({ ...buy, quantity: '0' }, ctx).errors.quantity).toBe('quantityPositive');
  });

  it('limit orders need a price and reserve at that price', () => {
    expect(deriveOrder({ ...buy, type: 'LIMIT', quantity: '2' }, ctx).errors.price).toBe(
      'priceRequired',
    );
    const d = deriveOrder({ ...buy, type: 'LIMIT', quantity: '2', price: '84,5' }, ctx);
    expect(d).toMatchObject({
      limitPriceCents: 8450,
      unitPriceCents: 8450,
      totalCents: 16900,
      isValid: true,
    });
  });

  it('limit buy by amount still sizes the order with the last price', () => {
    const d = deriveOrder(
      { ...buy, type: 'LIMIT', mode: 'amount', amount: '1000', price: '40' },
      ctx,
    );
    expect(d.quantity).toBe(21);
    expect(d.totalCents).toBe(21 * 4000);
  });

  it('rejects a buy above the available cash, but not when cash is unknown', () => {
    expect(deriveOrder({ ...buy, quantity: '22' }, ctx).errors.form).toBe('insufficientCash');
    expect(
      deriveOrder({ ...buy, quantity: '22' }, { ...ctx, availableCashCents: null }).isValid,
    ).toBe(true);
  });

  it('rejects a sell above the shares owned', () => {
    expect(deriveOrder({ ...sell, quantity: '6' }, ctx).errors.form).toBe('insufficientShares');
    expect(deriveOrder({ ...sell, quantity: '5' }, ctx).isValid).toBe(true);
    expect(
      deriveOrder({ ...sell, quantity: '1' }, { ...ctx, availableShares: 0 }).errors.form,
    ).toBe('insufficientShares');
  });

  it('skips the balance checks while the quantity is still invalid', () => {
    const d = deriveOrder({ ...sell, quantity: '' }, { ...ctx, availableShares: 0 });
    expect(d.errors).toEqual({ quantity: 'quantityPositive' });
  });
});

describe('quickPicks', () => {
  const pickCtx: OrderFormContext = {
    lastPriceCents: 4572,
    availableCashCents: 14272358,
    availableShares: 10,
  };
  const next = (picks: ReturnType<typeof quickPicks>) => picks.map((p) => p.next);

  it('adds shares in quantity mode and caps Max at what the cash buys', () => {
    const values = { ...initialOrderValues('BUY'), quantity: '2' };
    expect(next(quickPicks(values, pickCtx, 4572))).toEqual(['3', '12', '102', '3121']);
  });
  it('sells every share owned on Max', () => {
    const values = initialOrderValues('SELL');
    expect(quickPicks(values, pickCtx, 4572).at(-1)?.next).toBe('10');
  });
  it('sets ARS presets in amount mode and marks the one typed', () => {
    const values = { ...initialOrderValues('BUY'), mode: 'amount' as const, amount: '5000' };
    const picks = quickPicks(values, pickCtx, 4572);
    expect(next(picks)).toEqual(['1000', '5000', '10000', '142723.58']);
    expect(picks.map((p) => p.selected)).toEqual([false, true, false, false]);
  });
  it('disables Max until the portfolio is known', () => {
    const unknown = { ...pickCtx, availableCashCents: null };
    expect(quickPicks(initialOrderValues('BUY'), unknown, 4572).at(-1)?.next).toBeNull();
  });
  it('uses the limit price for Max when there is one', () => {
    const values = { ...initialOrderValues('BUY'), type: 'LIMIT' as const };
    expect(quickPicks(values, { ...pickCtx, availableCashCents: 10000 }, 2500).at(-1)?.next).toBe(
      '4',
    );
  });
});
