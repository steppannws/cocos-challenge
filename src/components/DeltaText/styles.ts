import { StyleSheet } from 'react-native';
import { colors, radii, spacing } from '@/theme';

export const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.pill,
  },
  gain: { backgroundColor: colors.gain },
  loss: { backgroundColor: colors.loss },
  textMuted: { backgroundColor: colors.surface },
});
