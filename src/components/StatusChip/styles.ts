import { StyleSheet } from 'react-native';
import { colors, radii, spacing } from '@/theme';

export const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
  },
  FILLED: { backgroundColor: colors.gainMuted },
  PENDING: { backgroundColor: colors.warningMuted },
  REJECTED: { backgroundColor: colors.lossMuted },
});

export const textColor = { FILLED: 'gain', PENDING: 'warning', REJECTED: 'loss' } as const;
