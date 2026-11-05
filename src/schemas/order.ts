import { z } from 'zod';
import { toCents } from '@/utils/money';

export const orderSides = ['BUY', 'SELL'] as const;
export const orderTypes = ['MARKET', 'LIMIT'] as const;
export const orderStatuses = ['FILLED', 'PENDING', 'REJECTED'] as const;

export type OrderSide = (typeof orderSides)[number];
export type OrderType = (typeof orderTypes)[number];
export type OrderStatus = (typeof orderStatuses)[number];

export const orderSchema = z
  .object({
    id: z.union([z.number(), z.string()]).transform(String),
    instrument_id: z.number().int(),
    side: z.enum(orderSides),
    type: z.enum(orderTypes),
    quantity: z.number().int(),
    price: z.number().nullish(),
    status: z.enum(orderStatuses),
    created_at: z.string(),
  })
  .transform((raw) => ({
    id: raw.id,
    instrumentId: raw.instrument_id,
    side: raw.side,
    type: raw.type,
    quantity: raw.quantity,
    priceCents: raw.price == null ? null : toCents(raw.price),
    status: raw.status,
    createdAt: raw.created_at,
  }));

export const orderListSchema = z.array(orderSchema);

export type Order = z.infer<typeof orderSchema>;

export type PlaceOrderInput = {
  instrumentId: number;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  /** Required for LIMIT orders. */
  priceCents?: number;
};
