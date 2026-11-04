import { StyleSheet } from 'react-native';
import { colors, radii, spacing } from '@/theme';

export const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surfaceStrong },
  ghost: { backgroundColor: colors.transparent },
  gain: { backgroundColor: colors.gain },
  loss: { backgroundColor: colors.loss },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.8 },
});

export const labelStyles = StyleSheet.create({
  primary: { color: colors.textOnPrimary },
  secondary: { color: colors.text },
  ghost: { color: colors.primary },
});
