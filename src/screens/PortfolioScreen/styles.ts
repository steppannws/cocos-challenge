import { StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme';

export const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.lg },
  list: { paddingBottom: spacing.xl },
  summaryRows: { gap: spacing.xxs },
});

export const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  pressed: { backgroundColor: colors.surface },
  main: { flex: 1, gap: spacing.xxs },
  trailing: { alignItems: 'flex-end', gap: spacing.xxs },
});
