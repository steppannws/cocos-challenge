import type { Holding, Portfolio } from '@/schemas/portfolio';
import type { Cents } from './money';

/** (last − close) / close as a fraction. `null` when there is no close price to compare with. */
export const dailyReturn = (lastPriceCents: Cents, closePriceCents: Cents): number | null =>
  closePriceCents > 0 ? (lastPriceCents - closePriceCents) / closePriceCents : null;

type HoldingMetrics = {
  marketValueCents: Cents;
  costCents: Cents;
  pnlCents: Cents;
  /** pnl / cost as a fraction; `null` when the position cost nothing. */
  returnRatio: number | null;
};

// Spec: market value = quantity × last_price; P&L against avg_cost_price (weighted average buy price).
export const holdingMetrics = (
  holding: Pick<Holding, 'quantity' | 'lastPriceCents' | 'avgCostCents'>,
): HoldingMetrics => {
  const marketValueCents = holding.quantity * holding.lastPriceCents;
  const costCents = holding.quantity * holding.avgCostCents;
  const pnlCents = marketValueCents - costCents;
  return {
    marketValueCents,
    costCents,
    pnlCents,
    returnRatio: costCents > 0 ? pnlCents / costCents : null,
  };
};

export type PortfolioTotals = HoldingMetrics & {
  cashCents: Cents;
  /** cash + market value of every holding */
  totalCents: Cents;
};

export const portfolioTotals = (portfolio: Portfolio): PortfolioTotals => {
  const sum = portfolio.holdings.reduce(
    (acc, holding) => {
      const m = holdingMetrics(holding);
      acc.marketValueCents += m.marketValueCents;
      acc.costCents += m.costCents;
      return acc;
    },
    { marketValueCents: 0, costCents: 0 },
  );
  const pnlCents = sum.marketValueCents - sum.costCents;
  return {
    ...sum,
    pnlCents,
    returnRatio: sum.costCents > 0 ? pnlCents / sum.costCents : null,
    cashCents: portfolio.cashCents,
    totalCents: portfolio.cashCents + sum.marketValueCents,
  };
};

export type AllocationSlice = {
  /** `null` is the cash slice. */
  ticker: string | null;
  valueCents: Cents;
  /** Fraction of the total, 0..1. */
  share: number;
};

/** Holdings by market value (largest first), then cash. Empty slices are dropped. */
export const portfolioAllocation = (portfolio: Portfolio): AllocationSlice[] => {
  const slices: Omit<AllocationSlice, 'share'>[] = portfolio.holdings
    .map((holding) => ({
      ticker: holding.ticker,
      valueCents: holdingMetrics(holding).marketValueCents,
    }))
    .filter((slice) => slice.valueCents > 0)
    .sort((a, b) => b.valueCents - a.valueCents);
  if (portfolio.cashCents > 0) {
    slices.push({ ticker: null, valueCents: portfolio.cashCents });
  }
  const total = slices.reduce((sum, slice) => sum + slice.valueCents, 0);
  return slices.map((slice) => ({ ...slice, share: total > 0 ? slice.valueCents / total : 0 }));
};

type Priced = { lastPriceCents: Cents; closePriceCents: Cents };

/** Instruments with the largest absolute daily change, biggest first. No close price = skipped. */
export const topMovers = <T extends Priced>(items: readonly T[], limit = 5) =>
  items
    .map((item) => ({ item, change: dailyReturn(item.lastPriceCents, item.closePriceCents) }))
    .filter((entry): entry is { item: T; change: number } => entry.change !== null)
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, limit);
