import { z } from 'zod';
import { orderListSchema, orderSchema, type PlaceOrderInput } from '@/schemas/order';
import { fromCents } from '@/utils/money';
import { request } from './client';

export const getOrders = (signal?: AbortSignal) =>
  request('/orders', { schema: orderListSchema, signal });

export const placeOrder = (input: PlaceOrderInput) =>
  request('/orders', {
    method: 'POST',
    schema: orderSchema,
    body: {
      instrument_id: input.instrumentId,
      side: input.side,
      type: input.type,
      quantity: input.quantity,
      // The API takes float pesos; LIMIT needs a price, MARKET must not send one.
      ...(input.type === 'LIMIT' && input.priceCents !== undefined
        ? { price: fromCents(input.priceCents) }
        : {}),
    },
  });

/** Dev tool: wipes this candidate's orders and holdings (back to 1,000,000 ARS). */
export const resetAccount = () => request('/reset', { method: 'POST', schema: z.unknown() });
