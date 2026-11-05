import { StyleSheet } from 'react-native';
import { colors, fontSizes, radii, spacing } from '@/theme';

export const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  searchInput: { flex: 1, fontSize: fontSizes.md, color: colors.text, paddingVertical: spacing.sm },
  clear: { padding: spacing.xs },
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
  trailing: { alignItems: 'flex-end', gap: spacing.xxs },
});

export const moverStyles = StyleSheet.create({
  list: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  card: {
    width: 132,
    padding: spacing.md,
    gap: spacing.xs,
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: radii.lg,
  },
  pressed: { backgroundColor: colors.surface },
});
