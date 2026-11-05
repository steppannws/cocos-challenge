import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, RefreshControl, SectionList, View } from 'react-native';
import { QueryStateView } from '@/components/QueryStateView';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { useInstrumentsById } from '@/hooks/useInstrumentsById';
import { useLocale } from '@/hooks/useLocale';
import { useOrders } from '@/hooks/useOrders';
import { useRefresh } from '@/hooks/useRefresh';
import { useTabBarSpace } from '@/navigation/FloatingTabBar';
import { type Order, type OrderStatus, orderStatuses } from '@/schemas/order';
import { useTheme } from '@/theme';
import { formatDate } from '@/utils/format';
import { groupByDay } from '@/utils/orders';
import { OrderRow } from './components/OrderRow';
import { useStyles } from './styles';

const keyExtractor = (item: Order) => item.id;

type Filter = OrderStatus | 'ALL';
const filters: readonly Filter[] = ['ALL', ...orderStatuses];

export function OrdersScreen() {
  const { t } = useTranslation();
  const locale = useLocale();
  const orders = useOrders();
  const instrumentsById = useInstrumentsById();
  const { refreshing, onRefresh } = useRefresh(orders.refetch);
  const navigation = useNavigation();
  const { styles } = useStyles();
  const { colors } = useTheme();
  const tabBarSpace = useTabBarSpace();
  const [filter, setFilter] = useState<Filter>('ALL');
  const openDetail = useCallback(
    (order: Order) => navigation.navigate('OrderDetail', { orderId: order.id }),
    [navigation],
  );

  // Newest first (the API returns insertion order), filtered on the client, grouped by day.
  const sections = useMemo(() => {
    const sorted = [...(orders.data ?? [])]
      .filter((order) => filter === 'ALL' || order.status === filter)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return groupByDay(sorted, (iso) => formatDate(iso, locale));
  }, [orders.data, filter, locale]);

  return (
    <Screen testID="orders-screen">
      <SectionList
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => (
          <OrderRow
            order={item}
            ticker={instrumentsById.get(item.instrumentId)?.ticker ?? `#${item.instrumentId}`}
            onPress={openDetail}
          />
        )}
        renderSectionHeader={({ section }) => (
          <Text variant="label" style={styles.day}>
            {section.title}
          </Text>
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text variant="title">{t('orders.title')}</Text>
            <View
              style={styles.filters}
              accessibilityRole="radiogroup"
              accessibilityLabel={t('orders.filter.label')}
            >
              {filters.map((value) => {
                const selected = value === filter;
                const label =
                  value === 'ALL' ? t('orders.filter.all') : t(`orders.status.${value}`);
                return (
                  <Pressable
                    key={value}
                    accessibilityRole="radio"
                    accessibilityLabel={label}
                    accessibilityState={{ selected, checked: selected }}
                    onPress={() => setFilter(value)}
                    style={[styles.chip, selected && styles.chipSelected]}
                    testID={`orders-filter-${value}`}
                  >
                    <Text variant="captionStrong" color={selected ? 'background' : 'text'}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          <QueryStateView
            isLoading={orders.isPending}
            error={orders.error}
            emptyTitle={filter === 'ALL' ? t('orders.empty') : t('orders.filter.empty')}
            emptyHint={filter === 'ALL' ? t('orders.emptyHint') : undefined}
            onRetry={orders.refetch}
            testID="orders-state"
          />
        }
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: tabBarSpace }}
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
