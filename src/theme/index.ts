// The only place colors, spacing, fonts and radii are defined (lint blocks hex literals elsewhere).
export const colors = {
  background: '#FFFFFF',
  surface: '#F4F5F9',
  surfaceStrong: '#E9EBF3',
  border: '#E2E5EE',
  text: '#0B1021',
  textMuted: '#6B7280',
  textOnPrimary: '#FFFFFF',
  primary: '#2E5BFF',
  primaryMuted: '#E6ECFF',
  gain: '#13925A',
  gainMuted: '#E3F6EC',
  loss: '#D92D20',
  lossMuted: '#FDE8E6',
  warning: '#B7791F',
  warningMuted: '#FCF1DC',
  overlay: 'rgba(11, 16, 33, 0.45)',
  transparent: 'transparent',
} as const;

export const spacing = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radii = { sm: 6, md: 10, lg: 16, xl: 24, pill: 999 } as const;

export const fontSizes = { xs: 12, sm: 14, md: 16, lg: 20, xl: 28, xxl: 36 } as const;

export const fontWeights = { regular: '400', medium: '500', semibold: '600', bold: '700' } as const;

export type Color = keyof typeof colors;
export type Spacing = keyof typeof spacing;
export type FontSize = keyof typeof fontSizes;
