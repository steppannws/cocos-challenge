import { View } from 'react-native';
import { Text } from '@/components/Text';
import { avatarTints } from '@/theme';
import { styles } from './styles';

// Same ticker, same tint on every screen.
export const tintFor = (ticker: string) => {
  let hash = 0;
  for (const char of ticker) {
    hash = (hash * 31 + char.charCodeAt(0)) % avatarTints.length;
  }
  return avatarTints[hash] ?? avatarTints[0];
};

export function TickerAvatar({ ticker }: { ticker: string }) {
  const tint = tintFor(ticker);
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
