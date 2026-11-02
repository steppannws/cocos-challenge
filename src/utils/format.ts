import type { Cents } from './money';

export type Locale = 'es-AR' | 'en-US';

const currency = new Map<Locale, Intl.NumberFormat>();
const number = new Map<Locale, Intl.NumberFormat>();

const currencyFormatter = (locale: Locale): Intl.NumberFormat => {
  let f = currency.get(locale);
  if (!f) {
    f = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    currency.set(locale, f);
  }
  return f;
};

const numberFormatter = (locale: Locale): Intl.NumberFormat => {
  let f = number.get(locale);
  if (!f) {
    f = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    number.set(locale, f);
  }
  return f;
};

type SignOptions = { signed?: boolean };

// Sign is added by hand: Hermes on Android does not support Intl signDisplay on every OS version.
const withSign = (text: string, value: number, signed: boolean): string => {
  if (!signed || value === 0) {
    return text;
  }
  return value > 0 ? `+${text}` : `−${text}`;
};

export const formatMoney = (cents: Cents, locale: Locale, { signed = false }: SignOptions = {}) =>
  withSign(currencyFormatter(locale).format(Math.abs(cents) / 100), cents, signed);

/** `ratio` is a fraction (0.0125 = 1.25 %). `null` renders as a dash (no close price). */
export const formatPercent = (
  ratio: number | null,
  locale: Locale,
  { signed = true }: SignOptions = {},
) => {
  if (ratio === null || !Number.isFinite(ratio)) {
    return '—';
  }
  return withSign(`${numberFormatter(locale).format(Math.abs(ratio) * 100)} %`, ratio, signed);
};

export const formatQuantity = (quantity: number, locale: Locale) =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(quantity);

// ISO 8601 from the API; explicit parts instead of dateStyle, which Hermes does not support everywhere.
export const formatDateTime = (iso: string, locale: Locale): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
