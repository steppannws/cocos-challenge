import { StyleSheet } from 'react-native';
import { colors, fontSizes, fontWeights, radii, spacing } from '@/theme';

export const styles = StyleSheet.create({
  tabBar: { backgroundColor: colors.card, borderTopColor: colors.border },
  tabLabel: { fontSize: fontSizes.xs, fontWeight: fontWeights.medium },
  tabIcon: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    borderRadius: radii.pill,
  },
  tabIconFocused: { backgroundColor: colors.primaryMuted },
});
