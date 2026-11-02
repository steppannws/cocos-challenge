import { View } from 'react-native';
import { Text } from '@/components/Text';
import { styles } from './styles';

export function TickerAvatar({ ticker }: { ticker: string }) {
  return (
    <View style={styles.circle} accessibilityElementsHidden importantForAccessibility="no">
      <Text variant="captionStrong" color="primary">
        {ticker.slice(0, 3).toUpperCase()}
      </Text>
    </View>
  );
}
