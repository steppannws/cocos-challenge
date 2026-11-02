import { View } from 'react-native';
import { Text } from '@/components/Text';
import { styles } from './styles';

export function SectionHeader({ title, detail }: { title: string; detail?: string }) {
  return (
    <View style={styles.row}>
      <Text variant="heading">{title}</Text>
      {detail ? <Text variant="caption">{detail}</Text> : null}
    </View>
  );
}
