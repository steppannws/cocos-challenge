import { View } from 'react-native';
import { Text } from '@/components/Text';
import type { Color } from '@/theme';
import { styles } from './styles';

type Props = { label: string; value: string; valueColor?: Color; testID?: string };

export function KeyValueRow({ label, value, valueColor, testID }: Props) {
  return (
    <View style={styles.row}>
      <Text variant="caption">{label}</Text>
      <Text variant="bodyStrong" color={valueColor} testID={testID}>
        {value}
      </Text>
    </View>
  );
}
