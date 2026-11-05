// The only place colors, spacing, fonts and radii are defined (lint blocks hex literals elsewhere).
// Brokerage look: deep-blue header band, white cards, navy text, pill controls.
export const colors = {
  background: '#F4F7FC',
  card: '#FFFFFF',
  surface: '#EAF0F9',
  surfaceStrong: '#DCE4F2',
  border: '#E1E7F2',
  text: '#0B1E45',
  textMuted: '#56627F',
  textOnPrimary: '#FFFFFF',
  primary: '#1F5FE0',
  primaryMuted: '#E4EDFD',
  gain: '#0E7A4A',
  gainMuted: '#E3F6EC',
  loss: '#C4271B',
  lossMuted: '#FDE8E6',
  warning: '#9A6215',
  warningMuted: '#FCF1DC',
  // Header band gradient (top → bottom). Only white text goes on it.
  heroTop: '#0A2462',
  heroBottom: '#1F5FE0',
  textOnHero: '#FFFFFF',
  // The mint point of the brand mark (app icon, splash). Brighter than `gain` so it reads on navy.
  brandAccent: '#4ADE80',
  overlay: 'rgba(11, 30, 69, 0.5)',
  transparent: 'transparent',
} as const;

// Ticker avatar tints: picked by a hash of the ticker so each instrument keeps its color.
export const avatarTints = [
  { background: '#E6ECFF', foreground: '#2E5BFF' },
  { background: '#E3F6EC', foreground: '#0E7A4A' },
  { background: '#FCF1DC', foreground: '#9A6215' },
  { background: '#F1E8FF', foreground: '#6D3FD6' },
  { background: '#FFE8EF', foreground: '#C02659' },
  { background: '#E0F4F7', foreground: '#0B7285' },
] as const;

export const spacing = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radii = { sm: 8, md: 12, lg: 20, xl: 28, pill: 999 } as const;

export const fontSizes = { xs: 12, sm: 14, md: 16, lg: 20, xl: 28, xxl: 36 } as const;

export const fontWeights = { regular: '400', medium: '500', semibold: '600', bold: '700' } as const;

export type Color = keyof typeof colors;
export type Spacing = keyof typeof spacing;
export type FontSize = keyof typeof fontSizes;
