import { StyleSheet } from 'react-native';
import { makeStyles, radii, spacing } from '@/theme';

export const useStyles = makeStyles((colors) => ({
  styles: StyleSheet.create({
    header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md },
    filters: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
    chip: {
      minHeight: 36,
      paddingHorizontal: spacing.md + 2,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      justifyContent: 'center',
    },
    chipSelected: { backgroundColor: colors.text, borderColor: colors.text },
    day: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.sm,
      backgroundColor: colors.background,
    },
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
    title: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
    trailing: { alignItems: 'flex-end', gap: spacing.xs },
  }),
}));
