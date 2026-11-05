import { View } from 'react-native';
import { Text } from '@/components/Text';
import { avatarTints, type ColorScheme, useTheme } from '@/theme';
import { styles } from './styles';

// Same ticker, same tint on every screen.
export const tintFor = (ticker: string, scheme: ColorScheme = 'light') => {
  const tints = avatarTints[scheme];
  let hash = 0;
  for (const char of ticker) {
    hash = (hash * 31 + char.charCodeAt(0)) % tints.length;
  }
  return tints[hash] ?? tints[0];
};

export function TickerAvatar({ ticker }: { ticker: string }) {
  const tint = tintFor(ticker, useTheme().scheme);
  return (
    <View
      style={[styles.tile, { backgroundColor: tint.background }]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      <Text variant="captionStrong" style={{ color: tint.foreground }}>
        {ticker.slice(0, 3).toUpperCase()}
      </Text>
    </View>
  );
}
