import { z } from 'zod';
import { toCents } from '@/utils/money';

// Raw API shape (snake_case, float prices) → app shape (camelCase, integer cents). The only place
// the API's field names and floats exist.
export const instrumentSchema = z
  .object({
    id: z.number().int(),
    ticker: z.string().min(1),
    name: z.string(),
    type: z.string(),
    last_price: z.number().nonnegative(),
    close_price: z.number().nonnegative(),
  })
  .transform((raw) => ({
    id: raw.id,
    ticker: raw.ticker,
    name: raw.name,
    type: raw.type,
    lastPriceCents: toCents(raw.last_price),
    closePriceCents: toCents(raw.close_price),
  }));

export const instrumentListSchema = z.array(instrumentSchema);

export type Instrument = z.infer<typeof instrumentSchema>;
