import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text } from '@/components/Text';
import type { OrderStatus } from '@/schemas/order';
import { textColor, useStyles } from './styles';

export function StatusChip({ status, testID }: { status: OrderStatus; testID?: string }) {
  const { t } = useTranslation();
  const { styles, dotStyles } = useStyles();
  return (
    <View style={[styles.chip, styles[status]]} testID={testID}>
      <View style={[styles.dot, dotStyles[status]]} />
      <Text variant="captionStrong" color={textColor[status]}>
        {t(`orders.status.${status}`)}
      </Text>
    </View>
  );
}
