import { StyleSheet } from 'react-native';
import { colors, fontSizes, fontWeights, radii, spacing } from '@/theme';

export const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.md,
    color: colors.text,
    backgroundColor: colors.card,
  },
  inputLarge: {
    minHeight: 72,
    borderRadius: radii.lg,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  inputError: { borderColor: colors.loss },
});
