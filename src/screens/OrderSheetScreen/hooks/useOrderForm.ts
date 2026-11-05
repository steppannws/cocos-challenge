import { useCallback, useMemo, useState } from 'react';
import type { OrderSide } from '@/schemas/order';
import {
  type DerivedOrder,
  deriveOrder,
  initialOrderValues,
  type OrderFieldErrors,
  type OrderFormContext,
  type OrderFormValues,
} from '../orderForm';

type Touched = Partial<Record<keyof OrderFormValues, boolean>>;

export function useOrderForm(initialSide: OrderSide, ctx: OrderFormContext) {
  const [values, setValues] = useState<OrderFormValues>(() => initialOrderValues(initialSide));
  const [touched, setTouched] = useState<Touched>({});

  const derived: DerivedOrder = useMemo(() => deriveOrder(values, ctx), [values, ctx]);

  const set = useCallback(<K extends keyof OrderFormValues>(key: K, value: OrderFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  }, []);

  const reset = useCallback(() => {
    setValues((prev) => initialOrderValues(prev.side));
    setTouched({});
  }, []);

  // Field errors wait until the field was touched; the balance error shows as soon as it applies.
  const visibleErrors: OrderFieldErrors = {
    quantity: touched.quantity ? derived.errors.quantity : undefined,
    amount: touched.amount ? derived.errors.amount : undefined,
    price: touched.price ? derived.errors.price : undefined,
    form: derived.errors.form,
  };

  return { values, set, reset, derived, visibleErrors };
}
