// The only place colors, spacing, fonts and radii are defined (lint blocks hex literals elsewhere).
// Two palettes with the same keys: light (navy brand) and dark (near-black, mint accent).
// Components read the active one through `useTheme` / `makeStyles` (useTheme.ts).

const light = {
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
  // Buy/sell and gain/loss. `onGain`/`onLoss` is the label color on a filled gain/loss button.
  gain: '#0E7A4A',
  gainMuted: '#E3F6EC',
  onGain: '#FFFFFF',
  loss: '#C4271B',
  lossMuted: '#FDE8E6',
  onLoss: '#FFFFFF',
  warning: '#9A6215',
  warningMuted: '#FCF1DC',
  // Header band gradient (top → bottom). Only white text goes on it.
  heroTop: '#0A2462',
  heroBottom: '#1F5FE0',
  textOnHero: '#FFFFFF',
  // Floating tab bar.
  tabBar: '#FFFFFF',
  shadow: '#0B1E45',
  overlay: 'rgba(11, 30, 69, 0.5)',
  transparent: 'transparent',
};

export type Palette = typeof light;

const dark: Palette = {
  background: '#0B0F14',
  card: '#141A22',
  surface: '#1C2430',
  surfaceStrong: '#2A3442',
  border: '#232C38',
  text: '#F2F5F8',
  textMuted: '#93A0B0',
  textOnPrimary: '#0B0F14',
  primary: '#4ADE80',
  primaryMuted: 'rgba(74, 222, 128, 0.12)',
  gain: '#4ADE80',
  // Dark mode shows changes as colored text, not tinted chips.
  gainMuted: 'transparent',
  onGain: '#0B0F14',
  loss: '#FF7A6E',
  lossMuted: 'transparent',
  onLoss: '#0B0F14',
  warning: '#FBBF24',
  warningMuted: 'rgba(251, 191, 36, 0.12)',
  heroTop: '#1A2B4C',
  heroBottom: '#0B0F14',
  textOnHero: '#FFFFFF',
  tabBar: '#141A22',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.6)',
  transparent: 'transparent',
};

export const palettes = { light, dark } as const;
export type ColorScheme = keyof typeof palettes;

// Brand marks (app icon, splash) do not follow the theme.
export const brand = { navy: '#0A2462', white: '#FFFFFF', mint: '#4ADE80' } as const;

// Ticker avatar tints: picked by a hash of the ticker so each instrument keeps its color.
// Light: tinted tiles. Dark: neutral tiles, the foreground still marks the allocation slice.
export const avatarTints = {
  light: [
    { background: '#E6ECFF', foreground: '#2E5BFF' },
    { background: '#E3F6EC', foreground: '#0E7A4A' },
    { background: '#FCF1DC', foreground: '#9A6215' },
    { background: '#F1E8FF', foreground: '#6D3FD6' },
    { background: '#FFE8EF', foreground: '#C02659' },
    { background: '#E0F4F7', foreground: '#0B7285' },
  ],
  dark: [
    { background: '#1C2430', foreground: '#60A5FA' },
    { background: '#1C2430', foreground: '#4ADE80' },
    { background: '#1C2430', foreground: '#FBBF24' },
    { background: '#1C2430', foreground: '#A78BFA' },
    { background: '#1C2430', foreground: '#F472B6' },
    { background: '#1C2430', foreground: '#2DD4BF' },
  ],
} as const;

export const spacing = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

// `control`: buttons, chips, inputs (rounded rectangles, not pills). `pill` only for the tab bar
// and the order sheet's side switch.
export const radii = { sm: 8, control: 14, md: 12, lg: 20, xl: 28, pill: 999 } as const;

export const fontSizes = { xs: 12, sm: 14, md: 16, lg: 20, xl: 28, xxl: 36 } as const;

export const fontWeights = { regular: '400', medium: '500', semibold: '600', bold: '700' } as const;

export type Color = keyof Palette;
export type Spacing = keyof typeof spacing;
export type FontSize = keyof typeof fontSizes;
