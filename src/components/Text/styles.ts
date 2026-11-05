import { StyleSheet } from 'react-native';
import { fontSizes, fontWeights, makeStyles } from '@/theme';

export const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    display: {
      fontSize: fontSizes.xxl,
      fontWeight: fontWeights.bold,
      color: colors.text,
      letterSpacing: -1,
      fontVariant: ['tabular-nums'],
    },
    title: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      color: colors.text,
      letterSpacing: -0.5,
    },
    heading: { fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, color: colors.text },
    body: { fontSize: fontSizes.md, fontWeight: fontWeights.regular, color: colors.text },
    bodyStrong: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      fontVariant: ['tabular-nums'],
    },
    caption: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.regular,
      color: colors.textMuted,
      fontVariant: ['tabular-nums'],
    },
    captionStrong: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      fontVariant: ['tabular-nums'],
    },
    label: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.medium,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
  }),
);

export type TextVariant = keyof ReturnType<typeof useStyles>;
