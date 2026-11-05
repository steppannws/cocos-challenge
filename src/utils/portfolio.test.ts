import { describe, expect, it } from 'vitest';
import {
  dailyReturn,
  holdingMetrics,
  portfolioAllocation,
  portfolioTotals,
  topMovers,
} from './portfolio';

describe('dailyReturn', () => {
  it('computes (last - close) / close', () => {
    expect(dailyReturn(4572, 5007)).toBeCloseTo(-0.08688, 5);
    expect(dailyReturn(5368, 4971)).toBeCloseTo(0.07986, 5);
  });
  it('returns null without a close price instead of dividing by zero', () => {
    expect(dailyReturn(100, 0)).toBeNull();
  });
});

describe('holdingMetrics', () => {
  it('derives market value, cost, pnl and return from quantity and prices', () => {
    const m = holdingMetrics({ quantity: 40, lastPriceCents: 5000, avgCostCents: 4572 });
    expect(m.marketValueCents).toBe(200000);
    expect(m.costCents).toBe(182880);
    expect(m.pnlCents).toBe(17120);
    expect(m.returnRatio).toBeCloseTo(0.09361, 5);
  });
  it('has no return ratio for a free position', () => {
    expect(
      holdingMetrics({ quantity: 3, lastPriceCents: 100, avgCostCents: 0 }).returnRatio,
    ).toBeNull();
  });
});

describe('portfolioTotals', () => {
  it('sums holdings and adds cash', () => {
    const totals = portfolioTotals({
      cashCents: 99817120,
      holdings: [
        {
          instrumentId: 1,
          ticker: 'DYCA',
          quantity: 40,
          lastPriceCents: 4572,
          closePriceCents: 5007,
          avgCostCents: 4572,
        },
        {
          instrumentId: 2,
          ticker: 'CAPX',
          quantity: 10,
          lastPriceCents: 5368,
          closePriceCents: 4971,
          avgCostCents: 5000,
        },
      ],
    });
    expect(totals.marketValueCents).toBe(40 * 4572 + 10 * 5368);
    expect(totals.costCents).toBe(40 * 4572 + 10 * 5000);
    expect(totals.pnlCents).toBe(3680);
    expect(totals.totalCents).toBe(99817120 + 40 * 4572 + 10 * 5368);
    expect(totals.returnRatio).toBeCloseTo(3680 / (40 * 4572 + 10 * 5000), 8);
  });
  it('handles an empty portfolio', () => {
    const totals = portfolioTotals({ cashCents: 100000000, holdings: [] });
    expect(totals).toMatchObject({
      marketValueCents: 0,
      pnlCents: 0,
      returnRatio: null,
      totalCents: 100000000,
    });
  });
});

const holding = (ticker: string, quantity: number, lastPriceCents: number) => ({
  instrumentId: ticker.length,
  ticker,
  quantity,
  lastPriceCents,
  closePriceCents: lastPriceCents,
  avgCostCents: lastPriceCents,
});

describe('portfolioAllocation', () => {
  it('orders holdings by market value, puts cash last and shares sum to 1', () => {
    const slices = portfolioAllocation({
      cashCents: 1000,
      holdings: [holding('AAA', 1, 1000), holding('BBB', 2, 1000), holding('ZERO', 0, 500)],
    });
    expect(slices.map((s) => s.ticker)).toEqual(['BBB', 'AAA', null]);
    expect(slices.map((s) => s.share)).toEqual([0.5, 0.25, 0.25]);
  });
  it('is empty when there is nothing to allocate', () => {
    expect(portfolioAllocation({ cashCents: 0, holdings: [] })).toEqual([]);
  });
});

describe('topMovers', () => {
  it('ranks by absolute daily change and skips instruments without a close price', () => {
    const items = [
      { id: 'up', lastPriceCents: 110, closePriceCents: 100 },
      { id: 'down', lastPriceCents: 80, closePriceCents: 100 },
      { id: 'flat', lastPriceCents: 100, closePriceCents: 100 },
      { id: 'noClose', lastPriceCents: 100, closePriceCents: 0 },
    ];
    expect(topMovers(items, 2).map((m) => m.item.id)).toEqual(['down', 'up']);
    expect(topMovers(items).map((m) => m.item.id)).toEqual(['down', 'up', 'flat']);
  });
  it('keeps only rises or only falls when a direction is given', () => {
    const items = [
      { id: 'up', lastPriceCents: 110, closePriceCents: 100 },
      { id: 'bigUp', lastPriceCents: 130, closePriceCents: 100 },
      { id: 'down', lastPriceCents: 80, closePriceCents: 100 },
      { id: 'flat', lastPriceCents: 100, closePriceCents: 100 },
    ];
    expect(topMovers(items, 5, 'gainers').map((m) => m.item.id)).toEqual(['bigUp', 'up']);
    expect(topMovers(items, 5, 'losers').map((m) => m.item.id)).toEqual(['down']);
  });
});
