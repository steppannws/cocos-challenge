import { StyleSheet } from 'react-native';
import { fontSizes, makeStyles, radii, spacing } from '@/theme';

export const useStyles = makeStyles((colors) => ({
  styles: StyleSheet.create({
    header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.control,
      paddingHorizontal: spacing.md,
      minHeight: 44,
    },
    searchInput: {
      flex: 1,
      fontSize: fontSizes.md,
      color: colors.text,
      paddingVertical: spacing.sm,
    },
    clear: { padding: spacing.xs },
    moversHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.sm,
    },
    toggle: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      padding: 2,
    },
    toggleOption: {
      minHeight: 32,
      paddingHorizontal: spacing.md,
      borderRadius: radii.md - 2,
      justifyContent: 'center',
    },
    toggleSelected: { backgroundColor: colors.card },
  }),
  rowStyles: StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.sm,
      padding: spacing.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.lg - 4,
    },
    pressed: { backgroundColor: colors.surface },
    main: { flex: 1, gap: spacing.xxs },
    trailing: { alignItems: 'flex-end', gap: spacing.xxs },
  }),
  moverStyles: StyleSheet.create({
    list: { paddingHorizontal: spacing.lg, gap: spacing.sm },
    card: {
      width: 144,
      padding: spacing.md,
      gap: spacing.xs,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.lg,
    },
    top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    bottom: { gap: spacing.xxs },
    pressed: { backgroundColor: colors.surface },
  }),
}));
