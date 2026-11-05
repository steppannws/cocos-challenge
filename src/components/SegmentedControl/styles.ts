import { StyleSheet } from 'react-native';
import { makeStyles, radii, spacing } from '@/theme';

export const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: radii.control,
      padding: spacing.xs,
    },
    option: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: radii.md - 2,
      alignItems: 'center',
    },
    // Selected option lifts to the card color; buy/sell fill with gain/loss.
    selected: { backgroundColor: colors.card },
    pill: { borderRadius: radii.pill },
    selectedGain: { backgroundColor: colors.gain },
    selectedLoss: { backgroundColor: colors.loss },
  }),
);
