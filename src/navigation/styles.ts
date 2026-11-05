import { StyleSheet } from 'react-native';
import { makeStyles, radii, spacing } from '@/theme';

export const TAB_BAR_HEIGHT = 64;

export const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    bar: {
      position: 'absolute',
      left: spacing.lg,
      right: spacing.lg,
      height: TAB_BAR_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingHorizontal: spacing.sm,
      backgroundColor: colors.tabBar,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.pill,
      shadowColor: colors.shadow,
      shadowOpacity: 0.12,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
    item: {
      minWidth: 48,
      height: 44,
      paddingHorizontal: spacing.md,
      borderRadius: radii.pill,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
    },
    itemFocused: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg },
  }),
);
