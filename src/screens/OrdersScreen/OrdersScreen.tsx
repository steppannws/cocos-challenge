import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, View } from 'react-native';
import { QueryStateView } from '@/components/QueryStateView';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { useInstrumentsById } from '@/hooks/useInstrumentsById';
import { useOrders } from '@/hooks/useOrders';
import { useRefresh } from '@/hooks/useRefresh';
import type { Order } from '@/schemas/order';
import { colors } from '@/theme';
import { OrderRow } from './components/OrderRow';
import { styles } from './styles';

const keyExtractor = (item: Order) => item.id;

export function OrdersScreen() {
  const { t } = useTranslation();
  const orders = useOrders();
  const instrumentsById = useInstrumentsById();
  const { refreshing, onRefresh } = useRefresh(orders.refetch);
  const navigation = useNavigation();
  const openDetail = useCallback(
    (order: Order) => navigation.navigate('OrderDetail', { orderId: order.id }),
    [navigation],
  );

  // Newest first; the API returns insertion order.
  const sorted = useMemo(
    () => [...(orders.data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [orders.data],
  );

  return (
    <Screen testID="orders-screen">
      <FlatList
        data={sorted}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => (
          <OrderRow
            order={item}
            ticker={instrumentsById.get(item.instrumentId)?.ticker ?? `#${item.instrumentId}`}
            onPress={openDetail}
          />
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text variant="title">{t('orders.title')}</Text>
          </View>
        }
        ListEmptyComponent={
          <QueryStateView
            isLoading={orders.isPending}
            error={orders.error}
            emptyTitle={t('orders.empty')}
            emptyHint={t('orders.emptyHint')}
            onRetry={orders.refetch}
            testID="orders-state"
          />
        }
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        testID="orders-list"
      />
    </Screen>
  );
}
