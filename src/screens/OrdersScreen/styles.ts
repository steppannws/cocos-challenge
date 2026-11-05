import { StyleSheet } from 'react-native';
import { colors, radii, spacing } from '@/theme';

export const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  list: { paddingBottom: spacing.xl },
});

export const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
  },
  pressed: { backgroundColor: colors.surface },
  main: { flex: 1, gap: spacing.xxs },
  trailing: { alignItems: 'flex-end', gap: spacing.xs },
});
