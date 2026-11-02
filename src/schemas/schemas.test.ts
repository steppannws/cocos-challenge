import { describe, expect, it } from 'vitest';
import { instrumentListSchema } from './instrument';
import { orderSchema } from './order';
import { portfolioSchema } from './portfolio';

describe('API schemas', () => {
  it('converts instrument prices to cents and camelCase', () => {
    const [dyca] = instrumentListSchema.parse([
      {
        id: 1,
        ticker: 'DYCA',
        name: 'Dycasa S.A.',
        type: 'ACCIONES',
        last_price: 45.72,
        close_price: 50.07,
      },
    ]);
    expect(dyca).toEqual({
      id: 1,
      ticker: 'DYCA',
      name: 'Dycasa S.A.',
      type: 'ACCIONES',
      lastPriceCents: 4572,
      closePriceCents: 5007,
    });
  });

  it('rejects an instrument list with a malformed item', () => {
    const result = instrumentListSchema.safeParse([
      { id: 1, ticker: 'DYCA', name: null, last_price: 'x' },
    ]);
    expect(result.success).toBe(false);
  });

  it('parses the portfolio shape', () => {
    const p = portfolioSchema.parse({
      cash: 998171.2,
      holdings: [
        {
          instrument_id: 1,
          ticker: 'DYCA',
          quantity: 40,
          last_price: 45.72,
          close_price: 50.07,
          avg_cost_price: 45.72,
        },
      ],
    });
    expect(p.cashCents).toBe(99817120);
    expect(p.holdings[0]).toMatchObject({ instrumentId: 1, quantity: 40, avgCostCents: 4572 });
  });

  it('parses an order and keeps the id as text', () => {
    const o = orderSchema.parse({
      id: 842779,
      candidate_id: 'x',
      instrument_id: 1,
      side: 'BUY',
      type: 'MARKET',
      quantity: 10,
      price: 45.72,
      status: 'FILLED',
      created_at: '2026-10-31T00:58:07.489Z',
    });
    expect(o).toMatchObject({ id: '842779', priceCents: 4572, status: 'FILLED' });
  });

  it('rejects an unknown order status', () => {
    expect(
      orderSchema.safeParse({
        id: 1,
        instrument_id: 1,
        side: 'BUY',
        type: 'MARKET',
        quantity: 1,
        status: 'DONE',
        created_at: '',
      }).success,
    ).toBe(false);
  });
});
