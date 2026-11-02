import { z } from 'zod';
import { toCents } from '@/utils/money';

export const holdingSchema = z
  .object({
    instrument_id: z.number().int(),
    ticker: z.string().min(1),
    quantity: z.number().int(),
    last_price: z.number().nonnegative(),
    close_price: z.number().nonnegative(),
    avg_cost_price: z.number().nonnegative(),
  })
  .transform((raw) => ({
    instrumentId: raw.instrument_id,
    ticker: raw.ticker,
    quantity: raw.quantity,
    lastPriceCents: toCents(raw.last_price),
    closePriceCents: toCents(raw.close_price),
    avgCostCents: toCents(raw.avg_cost_price),
  }));

// cash and holdings come net of what PENDING orders reserve (API contract).
export const portfolioSchema = z
  .object({ cash: z.number(), holdings: z.array(holdingSchema) })
  .transform((raw) => ({ cashCents: toCents(raw.cash), holdings: raw.holdings }));

export type Holding = z.infer<typeof holdingSchema>;
export type Portfolio = z.infer<typeof portfolioSchema>;
