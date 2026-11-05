import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon, type IconName } from '@/components/Icon';
import { KeyValueRow } from '@/components/KeyValueRow';
import { QueryStateView } from '@/components/QueryStateView';
import { Screen } from '@/components/Screen';
import { StatusChip } from '@/components/StatusChip';
import { Text } from '@/components/Text';
import { TickerAvatar } from '@/components/TickerAvatar';
import { useInstrumentsById } from '@/hooks/useInstrumentsById';
import { useLocale } from '@/hooks/useLocale';
import { useOrders } from '@/hooks/useOrders';
import type { RootStackParamList } from '@/navigation/types';
import type { OrderStatus } from '@/schemas/order';
import { type Color, useTheme } from '@/theme';
import { formatDateTime, formatMoney, formatQuantity } from '@/utils/format';
import { orderTotalCents } from '@/utils/orders';
import { useStyles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

const statusIcon: Record<OrderStatus, { name: IconName; color: Color }> = {
  FILLED: { name: 'check', color: 'gain' },
  PENDING: { name: 'clock', color: 'warning' },
  REJECTED: { name: 'alert', color: 'loss' },
};

export function OrderDetailScreen({ route, navigation }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { orderId } = route.params;
  const { t } = useTranslation();
  const locale = useLocale();
  const orders = useOrders();
  const instrumentsById = useInstrumentsById();
  // Read from the orders list: the API has no GET /orders/:id, and the list polls while pending.
  const order = orders.data?.find((item) => item.id === orderId);

  const close = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('common.close')}
      onPress={() => navigation.goBack()}
      style={styles.close}
      testID="order-detail-close"
    >
      <Icon name="close" size={18} color={colors.text} />
    </Pressable>
  );

  if (!order) {
    return (
      <Screen testID="order-detail" edges={Platform.OS === 'ios' ? ['bottom'] : ['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerMain} />
            {close}
          </View>
          <QueryStateView
            isLoading={orders.isPending}
            error={orders.error}
            emptyTitle={t('orderDetail.notFound')}
            onRetry={orders.refetch}
            testID="order-detail-state"
          />
        </View>
      </Screen>
    );
  }

  const instrument = instrumentsById.get(order.instrumentId);
  const ticker = instrument?.ticker ?? `#${order.instrumentId}`;
  const totalCents =
    order.priceCents === null ? null : orderTotalCents(order.quantity, order.priceCents);
  const explanation =
    order.status === 'FILLED'
      ? t(`orderDetail.explanation.FILLED_${order.type}`, {
          price: order.priceCents === null ? '—' : formatMoney(order.priceCents, locale),
        })
      : t(`orderDetail.explanation.${order.status}`);

  return (
    <Screen testID="order-detail" edges={Platform.OS === 'ios' ? ['bottom'] : ['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TickerAvatar ticker={ticker} />
          <View style={styles.headerMain}>
            <Text variant="heading">{ticker}</Text>
            {instrument ? (
              <Text variant="caption" numberOfLines={1}>
                {instrument.name}
              </Text>
            ) : null}
          </View>
          {close}
        </View>

        <View style={styles.hero}>
          <StatusChip status={order.status} testID="order-detail-status" />
          <Text variant="display" testID="order-detail-total">
            {totalCents === null ? '—' : formatMoney(totalCents, locale)}
          </Text>
          <Text variant="caption">
            {`${t(`orders.side.${order.side}`)} · ${t(`orders.type.${order.type}`)}`}
          </Text>
        </View>

        <Card
          style={[
            styles.explanation,
            order.status === 'REJECTED' && styles.rejected,
            order.status === 'PENDING' && styles.pending,
          ]}
          testID="order-detail-explanation"
        >
          <View style={styles.explanationTitle}>
            <Icon
              name={statusIcon[order.status].name}
              size={20}
              color={colors[statusIcon[order.status].color]}
            />
            <Text variant="bodyStrong">{t(`orderDetail.explanationTitle.${order.status}`)}</Text>
          </View>
          <Text variant="body">{explanation}</Text>
        </Card>

        <Card style={styles.details}>
          <KeyValueRow label={t('orderDetail.side')} value={t(`orders.side.${order.side}`)} />
          <KeyValueRow label={t('orderDetail.type')} value={t(`orders.type.${order.type}`)} />
          <KeyValueRow
            label={t('orderDetail.quantity')}
            value={formatQuantity(order.quantity, locale)}
          />
          <KeyValueRow
            label={t(order.type === 'LIMIT' ? 'orderDetail.limitPrice' : 'orderDetail.price')}
            value={order.priceCents === null ? '—' : formatMoney(order.priceCents, locale)}
          />
          <KeyValueRow
            label={t('orderDetail.total')}
            value={totalCents === null ? '—' : formatMoney(totalCents, locale)}
          />
          <KeyValueRow
            label={t('orderDetail.createdAt')}
            value={formatDateTime(order.createdAt, locale)}
          />
          <KeyValueRow label={t('orderDetail.id')} value={order.id} testID="order-detail-id" />
        </Card>

        {instrument ? (
          <Button
            label={t('orderDetail.tradeAgain', { ticker })}
            onPress={() =>
              navigation.replace('OrderSheet', {
                instrumentId: order.instrumentId,
                ticker,
                side: order.side,
              })
            }
            testID="order-detail-trade"
          />
        ) : null}
      </ScrollView>
    </Screen>
  );
}
