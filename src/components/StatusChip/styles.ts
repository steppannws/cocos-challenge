import { StyleSheet } from 'react-native';
import { makeStyles, radii, spacing } from '@/theme';

export const useStyles = makeStyles((colors) => ({
  styles: StyleSheet.create({
    chip: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
      borderRadius: radii.pill,
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    dot: { width: 6, height: 6, borderRadius: radii.pill },
    FILLED: { backgroundColor: colors.gainMuted },
    PENDING: { backgroundColor: colors.warningMuted },
    REJECTED: { backgroundColor: colors.lossMuted },
  }),
  dotStyles: StyleSheet.create({
    FILLED: { backgroundColor: colors.gain },
    PENDING: { backgroundColor: colors.warning },
    REJECTED: { backgroundColor: colors.loss },
  }),
}));

export const textColor = { FILLED: 'gain', PENDING: 'warning', REJECTED: 'loss' } as const;
