import { StyleSheet } from 'react-native';
import { colors, fontSizes, radii, spacing } from '@/theme';

// How far the balance card rides up into the blue band.
const OVERLAP = 72;

export const styles = StyleSheet.create({
  band: {
    paddingHorizontal: spacing.lg,
    paddingBottom: OVERLAP + spacing.lg,
  },
  bandOverscroll: {
    position: 'absolute',
    top: -1000,
    left: 0,
    right: 0,
    height: 1000,
    backgroundColor: colors.heroTop,
  },
  bandTitle: { paddingTop: spacing.md },
  list: { paddingBottom: spacing.xl },
  listBackground: { backgroundColor: colors.background },
  balanceCard: {
    marginTop: -OVERLAP,
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    gap: spacing.xl,
    borderRadius: radii.xl,
    shadowColor: colors.text,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  balanceTop: { gap: spacing.xs },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eye: { padding: spacing.xs },
  balanceRow: { flexDirection: 'row', alignItems: 'flex-start' },
  cents: { marginTop: spacing.xs, fontSize: fontSizes.lg },
  returnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  allocation: { gap: spacing.md },
  allocationBar: {
    flexDirection: 'row',
    height: 10,
    gap: 3,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  allocationSegment: { borderRadius: radii.pill },
  legend: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.lg, rowGap: spacing.xs },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: radii.pill },
  stats: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  stat: { flex: 1, gap: spacing.xxs },
  statDivider: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.border,
    paddingLeft: spacing.lg,
  },
  actions: { flexDirection: 'row', justifyContent: 'space-around' },
  action: { alignItems: 'center', gap: spacing.xs, minWidth: 72 },
  actionCircle: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCirclePrimary: { backgroundColor: colors.primary },
  actionPressed: { opacity: 0.7 },
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
