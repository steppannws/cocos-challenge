import { View } from 'react-native';
import { Text } from '@/components/Text';
import { styles } from './styles';

type Props = { title: string; hint?: string; testID?: string };

export function EmptyState({ title, hint, testID }: Props) {
  return (
    <View style={styles.container} testID={testID}>
      <Text variant="bodyStrong" style={styles.text}>
        {title}
      </Text>
      {hint ? (
        <Text variant="caption" style={styles.text}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
