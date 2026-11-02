import { StyleSheet } from 'react-native';
import { colors, fontSizes, fontWeights } from '@/theme';

export const styles = StyleSheet.create({
  tabBar: { backgroundColor: colors.background, borderTopColor: colors.border },
  tabLabel: { fontSize: fontSizes.xs, fontWeight: fontWeights.medium },
});
