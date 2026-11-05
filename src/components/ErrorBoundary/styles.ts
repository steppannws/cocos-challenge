import { StyleSheet } from 'react-native';
import { makeStyles, spacing } from '@/theme';

export const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xxl,
      gap: spacing.md,
    },
    text: { textAlign: 'center' },
  }),
);
