import type { OrderSide, OrderType } from '@/schemas/order';
import { toCents } from '@/utils/money';
import { maxSharesForAmount, orderTotalCents } from '@/utils/orders';

export type OrderMode = 'quantity' | 'amount';

export type OrderFormValues = {
  side: OrderSide;
  type: OrderType;
  mode: OrderMode;
  quantity: string;
  amount: string;
  price: string;
};

export type OrderFormContext = {
  lastPriceCents: number;
  /** `null` until the portfolio is known; then the check applies. */
  availableCashCents: number | null;
  availableShares: number | null;
};

export type OrderFormErrorKey =
  | 'quantityPositive'
  | 'quantityFractional'
  | 'amountPositive'
  | 'amountTooSmall'
  | 'priceRequired'
  | 'insufficientCash'
  | 'insufficientShares';

export type OrderFieldErrors = Partial<
  Record<'quantity' | 'amount' | 'price' | 'form', OrderFormErrorKey>
>;

export type DerivedOrder = {
  /** Whole shares to send: typed, or the max the amount buys at the last price. */
  quantity: number;
  /** Price the order reserves at: the limit price, or the last price for MARKET. */
  unitPriceCents: number;
  totalCents: number;
  limitPriceCents: number | null;
  errors: OrderFieldErrors;
  isValid: boolean;
};

export const initialOrderValues = (side: OrderSide): OrderFormValues => ({
  side,
  type: 'MARKET',
  mode: 'quantity',
  quantity: '',
  amount: '',
  price: '',
});

/** Accepts "84,5", "84.5", "1.500" and "1.234,56". Anything else is NaN. */
export const parseDecimal = (input: string): number => {
  const raw = input.replace(/\s/g, '');
  if (raw === '') {
    return Number.NaN;
  }
  // A single kind of separator before groups of exactly three digits ("1.500", "10,000") groups
  // thousands: ARS prices have two decimals, and es-AR users write 1500 as "1.500".
  if (/^[1-9]\d{0,2}(\.\d{3})+$/.test(raw) || /^[1-9]\d{0,2}(,\d{3})+$/.test(raw)) {
    return Number(raw.replace(/[.,]/g, ''));
  }
  const lastComma = raw.lastIndexOf(',');
  const lastDot = raw.lastIndexOf('.');
  let normalized = raw;
  if (lastComma > lastDot) {
    // Comma is the decimal mark; dots group thousands.
    normalized = raw.replace(/\./g, '').replace(',', '.');
  } else if (lastDot > lastComma) {
    normalized = raw.replace(/,/g, '');
  }
  return /^\d+(\.\d+)?$/.test(normalized) ? Number(normalized) : Number.NaN;
};

export const parseInteger = (input: string): number => {
  const raw = input.trim();
  return /^\d+$/.test(raw) ? Number(raw) : Number.NaN;
};

/** Everything the order sheet shows is derived from the typed values and the market context. */
export function deriveOrder(values: OrderFormValues, ctx: OrderFormContext): DerivedOrder {
  const errors: OrderFieldErrors = {};

  let limitPriceCents: number | null = null;
  if (values.type === 'LIMIT') {
    const price = parseDecimal(values.price);
    if (Number.isFinite(price) && price > 0) {
      limitPriceCents = toCents(price);
    } else {
      errors.price = 'priceRequired';
    }
  }
  const unitPriceCents = limitPriceCents ?? ctx.lastPriceCents;

  let quantity = 0;
  if (values.mode === 'quantity') {
    const typed = parseInteger(values.quantity);
    if (Number.isFinite(typed) && typed > 0) {
      quantity = typed;
    } else {
      // Spec: no fractional shares. "10.2" or "10,2" gets its own message, not "greater than 0".
      errors.quantity = /[.,]/.test(values.quantity) ? 'quantityFractional' : 'quantityPositive';
    }
  } else {
    const amount = parseDecimal(values.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      errors.amount = 'amountPositive';
    } else {
      // Spec: an ARS amount becomes the max whole shares at the last price.
      quantity = maxSharesForAmount(toCents(amount), ctx.lastPriceCents);
      if (quantity === 0) {
        errors.amount = 'amountTooSmall';
      }
    }
  }

  const totalCents = orderTotalCents(quantity, unitPriceCents);
  if (quantity > 0) {
    if (
      values.side === 'BUY' &&
      ctx.availableCashCents !== null &&
      totalCents > ctx.availableCashCents
    ) {
      errors.form = 'insufficientCash';
    }
    if (values.side === 'SELL' && ctx.availableShares !== null && quantity > ctx.availableShares) {
      errors.form = 'insufficientShares';
    }
  }

  return {
    quantity,
    unitPriceCents,
    totalCents,
    limitPriceCents,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
