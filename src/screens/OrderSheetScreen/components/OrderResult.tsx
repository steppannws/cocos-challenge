import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button } from '@/components/Button';
import { Icon, type IconName } from '@/components/Icon';
import { StatusChip } from '@/components/StatusChip';
import { Text } from '@/components/Text';
import type { Order } from '@/schemas/order';
import { type Color, useTheme } from '@/theme';
import { useStyles } from '../styles';

const icon: Record<Order['status'], { name: IconName; color: Color }> = {
  FILLED: { name: 'check', color: 'gain' },
  PENDING: { name: 'clock', color: 'warning' },
  REJECTED: { name: 'alert', color: 'loss' },
};

type Props = { order: Order; onNewOrder: () => void; onDone: () => void };

// Spec: show the id and status the POST returned.
export function OrderResult({ order, onNewOrder, onDone }: Props) {
  const { t } = useTranslation();
  const { styles } = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.result} testID="order-result">
      <Icon name={icon[order.status].name} size={48} color={colors[icon[order.status].color]} />
      <Text variant="heading" style={styles.resultText}>
        {t('order.result.title')}
      </Text>
      <StatusChip status={order.status} testID="order-result-status" />
      <Text variant="body" style={styles.resultText}>
        {t(`order.result.${order.status}`)}
      </Text>
      <Text variant="caption" testID="order-result-id">
        {t('order.result.id', { id: order.id })}
      </Text>
      <View style={styles.resultActions}>
        <Button
          label={t('order.newOrder')}
          onPress={onNewOrder}
          variant="secondary"
          testID="order-new"
        />
        <Button label={t('order.done')} onPress={onDone} testID="order-done" />
      </View>
    </View>
  );
}
