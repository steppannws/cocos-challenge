import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { StatusChip } from '@/components/StatusChip';
import { Text } from '@/components/Text';
import { TickerAvatar } from '@/components/TickerAvatar';
import { useLocale } from '@/hooks/useLocale';
import type { Order } from '@/schemas/order';
import { formatDateTime, formatMoney, formatQuantity } from '@/utils/format';
import { rowStyles as styles } from '../styles';

type Props = { order: Order; ticker: string; onPress: (order: Order) => void };

export const OrderRow = memo(function OrderRow({ order, ticker, onPress }: Props) {
  const { t } = useTranslation();
  const locale = useLocale();
  const side = t(`orders.side.${order.side}`);
  const type = t(`orders.type.${order.type}`);
  const quantity = formatQuantity(order.quantity, locale);
  const line =
    order.priceCents === null
      ? t('orders.lineNoPrice', { side, type, quantity })
      : t('orders.line', { side, type, quantity, price: formatMoney(order.priceCents, locale) });
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('orders.openDetail', {
        ticker,
        status: t(`orders.status.${order.status}`),
      })}
      onPress={() => onPress(order)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      testID={`order-row-${order.id}`}
    >
      <TickerAvatar ticker={ticker} />
      <View style={styles.main}>
        <Text variant="bodyStrong">{ticker}</Text>
        <Text variant="caption" numberOfLines={1}>
          {line}
        </Text>
        <Text
          variant="caption"
          numberOfLines={1}
        >{`${formatDateTime(order.createdAt, locale)} · ${t('orders.orderId', { id: order.id })}`}</Text>
      </View>
      <View style={styles.trailing}>
        <StatusChip status={order.status} testID={`order-row-${order.id}-status`} />
        {order.priceCents !== null ? (
          <Text variant="captionStrong">
            {formatMoney(order.quantity * order.priceCents, locale)}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
});
