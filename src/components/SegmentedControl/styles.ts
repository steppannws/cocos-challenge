import { StyleSheet } from 'react-native';
import { colors, radii, spacing } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    padding: spacing.xs,
  },
  option: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  selected: { backgroundColor: colors.primary },
  selectedGain: { backgroundColor: colors.gain },
  selectedLoss: { backgroundColor: colors.loss },
});
