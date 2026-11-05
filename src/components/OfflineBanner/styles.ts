import { StyleSheet } from 'react-native';
import { makeStyles, spacing } from '@/theme';

export const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    banner: {
      backgroundColor: colors.warningMuted,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
    },
  }),
);
