import type { Cents } from './money';

export type Locale = 'es-AR' | 'en-US';

const numberOptions = {
  money: { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  percent: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  quantity: { maximumFractionDigits: 0 },
} satisfies Record<string, Intl.NumberFormatOptions>;

// Building an Intl formatter is slow on Hermes and these run in every list row: build once.
const numberFormats = new Map<string, Intl.NumberFormat>();
const numberFormat = (locale: Locale, kind: keyof typeof numberOptions): Intl.NumberFormat => {
  const key = `${locale}:${kind}`;
  let f = numberFormats.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, numberOptions[kind]);
    numberFormats.set(key, f);
  }
  return f;
};

// Explicit parts instead of dateStyle, which Hermes does not support everywhere.
const dateOptions = {
  dateTime: {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  },
  date: { day: '2-digit', month: '2-digit', year: 'numeric' },
  time: { hour: '2-digit', minute: '2-digit' },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

const dateFormats = new Map<string, Intl.DateTimeFormat>();
const dateFormat = (locale: Locale, kind: keyof typeof dateOptions): Intl.DateTimeFormat => {
  const key = `${locale}:${kind}`;
  let f = dateFormats.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, dateOptions[kind]);
    dateFormats.set(key, f);
  }
  return f;
};

type SignOptions = { signed?: boolean };

// Sign is added by hand: Hermes on Android does not support Intl signDisplay on every OS version.
// A negative value always keeps its minus; `signed` only adds the plus.
const withSign = (text: string, value: number, signed: boolean): string => {
  if (value < 0) {
    return `−${text}`;
  }
  return signed && value > 0 ? `+${text}` : text;
};

export const formatMoney = (cents: Cents, locale: Locale, { signed = false }: SignOptions = {}) =>
  withSign(numberFormat(locale, 'money').format(Math.abs(cents) / 100), cents, signed);

/** `ratio` is a fraction (0.0125 = 1.25 %). `null` renders as a dash (no close price). */
export const formatPercent = (
  ratio: number | null,
  locale: Locale,
  { signed = true }: SignOptions = {},
) => {
  if (ratio === null || !Number.isFinite(ratio)) {
    return '—';
  }
  return withSign(
    `${numberFormat(locale, 'percent').format(Math.abs(ratio) * 100)} %`,
    ratio,
    signed,
  );
};

export const formatQuantity = (quantity: number, locale: Locale) =>
  numberFormat(locale, 'quantity').format(quantity);

// ISO 8601 from the API.
const formatIso = (iso: string, locale: Locale, kind: keyof typeof dateOptions): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '—' : dateFormat(locale, kind).format(date);
};

export const formatDateTime = (iso: string, locale: Locale) => formatIso(iso, locale, 'dateTime');
/** Day only, in the device time zone: also the key Orders groups its rows by. */
export const formatDate = (iso: string, locale: Locale) => formatIso(iso, locale, 'date');
export const formatTime = (iso: string, locale: Locale) => formatIso(iso, locale, 'time');
