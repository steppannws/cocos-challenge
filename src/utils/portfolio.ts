import type { Holding, Portfolio } from '@/schemas/portfolio';
import type { Cents } from './money';

/** (last − close) / close as a fraction. `null` when there is no close price to compare with. */
export const dailyReturn = (lastPriceCents: Cents, closePriceCents: Cents): number | null =>
  closePriceCents > 0 ? (lastPriceCents - closePriceCents) / closePriceCents : null;

export type HoldingMetrics = {
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
