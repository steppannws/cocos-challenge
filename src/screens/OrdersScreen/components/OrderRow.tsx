import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { StatusChip } from '@/components/StatusChip';
import { Text } from '@/components/Text';
import { TickerAvatar } from '@/components/TickerAvatar';
import { useLocale } from '@/hooks/useLocale';
import type { Order } from '@/schemas/order';
import { formatMoney, formatQuantity, formatTime } from '@/utils/format';
import { orderTotalCents } from '@/utils/orders';
import { useStyles } from '../styles';

type Props = { order: Order; ticker: string; onPress: (order: Order) => void };

// The day is the section header, so the row shows only the time, next to the side.
export const OrderRow = memo(function OrderRow({ order, ticker, onPress }: Props) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { rowStyles: styles } = useStyles();
  const time = formatTime(order.createdAt, locale);
  const type = t(`orders.type.${order.type}`);
  const quantity = formatQuantity(order.quantity, locale);
  const line =
    order.priceCents === null
      ? t('orders.rowLineNoPrice', { type, quantity })
      : t('orders.rowLine', { type, quantity, price: formatMoney(order.priceCents, locale) });
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
        <View style={styles.title}>
          <Text variant="bodyStrong">{ticker}</Text>
          <Text variant="captionStrong" color={order.side === 'BUY' ? 'gain' : 'loss'}>
            {t(`orders.side.${order.side}`)}
          </Text>
          <Text variant="caption">{time}</Text>
        </View>
        <Text variant="caption" numberOfLines={1}>
          {line}
        </Text>
      </View>
      <View style={styles.trailing}>
        {order.priceCents !== null ? (
          <Text variant="bodyStrong">
            {formatMoney(orderTotalCents(order.quantity, order.priceCents), locale)}
          </Text>
        ) : null}
        <StatusChip status={order.status} testID={`order-row-${order.id}-status`} />
      </View>
    </Pressable>
  );
});
