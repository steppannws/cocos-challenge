import { StyleSheet } from 'react-native';
import { colors, radii } from '@/theme';

export const styles = StyleSheet.create({
  circle: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
