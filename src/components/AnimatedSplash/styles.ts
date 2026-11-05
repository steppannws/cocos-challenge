import { StyleSheet } from 'react-native';
import { brand } from '@/theme';

export const MARK_SIZE = 100;

export const styles = StyleSheet.create({
  // Transparent on purpose: the navy is the disc, so the iris exit can shrink it.
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  disc: {
    position: 'absolute',
    backgroundColor: brand.navy,
  },
  mark: {
    width: MARK_SIZE,
    height: MARK_SIZE,
  },
});
