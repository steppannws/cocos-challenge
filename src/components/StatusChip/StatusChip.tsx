import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text } from '@/components/Text';
import type { OrderStatus } from '@/schemas/order';
import { styles, textColor } from './styles';

export function StatusChip({ status, testID }: { status: OrderStatus; testID?: string }) {
  const { t } = useTranslation();
  return (
    <View style={[styles.chip, styles[status]]} testID={testID}>
      <Text variant="captionStrong" color={textColor[status]}>
        {t(`orders.status.${status}`)}
      </Text>
    </View>
  );
}
