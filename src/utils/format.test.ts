import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatPercent,
  formatQuantity,
  formatTime,
} from './format';

// Intl output uses non-breaking spaces; normalize before asserting.
const plain = (s: string) => s.replace(/\s/g, ' ');

describe('formatMoney', () => {
  it('formats cents as ARS in es-AR', () => {
    expect(plain(formatMoney(123456, 'es-AR'))).toBe('$ 1.234,56');
  });
  it('formats cents as ARS in en-US', () => {
    expect(plain(formatMoney(123456, 'en-US'))).toBe('ARS 1,234.56');
  });
  it('adds an explicit sign when asked', () => {
    expect(plain(formatMoney(5000, 'es-AR', { signed: true }))).toBe('+$ 50,00');
    expect(plain(formatMoney(-5000, 'es-AR', { signed: true }))).toBe('−$ 50,00');
    expect(plain(formatMoney(0, 'es-AR', { signed: true }))).toBe('$ 0,00');
  });
  it('keeps the minus on a negative amount without signed', () => {
    expect(plain(formatMoney(-150000, 'es-AR'))).toBe('−$ 1.500,00');
    expect(formatPercent(-0.5, 'es-AR', { signed: false })).toBe('−50,00 %');
  });
});

describe('formatPercent', () => {
  it('formats a ratio with sign', () => {
    expect(formatPercent(0.0125, 'es-AR')).toBe('+1,25 %');
    expect(formatPercent(-0.0869, 'en-US')).toBe('−8.69 %');
  });
  it('renders a dash when there is no ratio', () => {
    expect(formatPercent(null, 'es-AR')).toBe('—');
    expect(formatPercent(Number.NaN, 'es-AR')).toBe('—');
  });
});

describe('formatQuantity', () => {
  it('groups thousands without decimals', () => {
    expect(formatQuantity(1234, 'es-AR')).toBe('1.234');
  });
});

describe('formatDateTime', () => {
  it('renders ISO strings and tolerates garbage', () => {
    expect(formatDateTime('2026-10-31T00:58:07.489Z', 'en-US')).toMatch(/\d{2}\/\d{2}\/2026/);
    expect(formatDateTime('not a date', 'en-US')).toBe('—');
  });
});

describe('formatDate / formatTime', () => {
  it('splits an ISO string into day and time, and tolerates garbage', () => {
    const iso = '2026-10-31T12:58:07.489Z';
    expect(formatDate(iso, 'en-US')).toMatch(/^\d{2}\/\d{2}\/2026$/);
    expect(formatTime(iso, 'en-US')).toMatch(/^\d{2}:\d{2}/);
    expect(formatDate('not a date', 'en-US')).toBe('—');
  });
});
