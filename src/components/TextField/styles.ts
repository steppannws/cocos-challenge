import { StyleSheet } from 'react-native';
import { colors, fontSizes, radii, spacing } from '@/theme';

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
    backgroundColor: colors.background,
  },
  inputError: { borderColor: colors.loss },
});
