import { StyleSheet } from 'react-native';
import { colors, fontSizes, fontWeights } from '@/theme';

export const styles = StyleSheet.create({
  display: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    color: colors.text,
    letterSpacing: -1,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  heading: { fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, color: colors.text },
  body: { fontSize: fontSizes.md, fontWeight: fontWeights.regular, color: colors.text },
  bodyStrong: { fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.text },
  caption: { fontSize: fontSizes.sm, fontWeight: fontWeights.regular, color: colors.textMuted },
  captionStrong: { fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.text },
  label: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});

export type TextVariant = keyof typeof styles;
